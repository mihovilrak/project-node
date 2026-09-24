import nodemailer from 'nodemailer';
import handlebars, { TemplateDelegate } from 'handlebars';
import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';
import {
  EmailService as IEmailService,
  EmailTemplates,
  MailOptions,
  EmailInfo,
  TemplateData,
} from '../types/email.types';

class EmailService implements IEmailService {
  public transporter: nodemailer.Transporter;
  public templates: EmailTemplates;
  private templateDir: string;

  constructor() {
    this.transporter = EmailService.createTransport();
    this.templates = {};
    this.templateDir = EmailService.resolveTemplateDir();
  }

  /**
   * Return the filesystem path to the templates directory, preferring the TEMPLATES_PATH environment variable and otherwise checking both __dirname/templates and __dirname/../templates so it works whether the app runs as compiled output (where __dirname is dist/services/) or as an ncc bundle (flattened to /app/service).
   *
   * If process.env.TEMPLATES_PATH is set, that value is returned immediately (the Docker image typically sets this). Otherwise the method builds two candidate paths: path.join(__dirname, 'templates') and path.join(__dirname, '..', 'templates'). It returns the first candidate that exists (checked with existsSync); if neither exists it falls back to the first candidate. There are no side effects; callers should be prepared to receive a path that may not exist if no candidate was found.
   */
  private static resolveTemplateDir(): string {
    if (process.env.TEMPLATES_PATH) {
      return process.env.TEMPLATES_PATH;
    }
    const candidates = [
      path.join(__dirname, 'templates'),
      path.join(__dirname, '..', 'templates'),
    ];
    return candidates.find((dir) => existsSync(dir)) ?? candidates[0];
  }

  /**
   * Create and configure a nodemailer transporter from config.email, enforcing STARTTLS protection (requireTLS when not using secure), minimum TLS v1.2, authentication, and connection pooling (maxConnections 5, maxMessages 100).
   */
  private static createTransport(): nodemailer.Transporter {
    const { secure, port } = config.email;
    return nodemailer.createTransport({
      host: config.email.host,
      port,
      secure,
      // On the STARTTLS ports the connection starts in the clear, so without
      // requireTLS nodemailer would silently fall back to sending unencrypted.
      requireTLS: !secure,
      tls: { minVersion: 'TLSv1.2' },
      auth: config.email.auth,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  /**
   * Replace the current SMTP transporter with a newly created one and close the previous transport's connection pool so keep-alive connections do not outlive the credentials they used.
   *
   * Creates a new transporter using EmailService.createTransport(), assigns it to this.transporter, then calls close() on the previous transporter. Intended to be invoked when SMTP settings change at runtime (for example via the admin UI); it ensures subsequent sends use the updated SMTP configuration and that any pooled/keep-alive connections opened with the old credentials are terminated.
   */
  refreshTransport(): void {
    const previous = this.transporter;
    this.transporter = EmailService.createTransport();
    previous.close();
  }

  /**
   * Preload and compile every .hbs template in the service's template directory, caching each via loadTemplate.
   */
  async initializeTemplates(): Promise<void> {
    try {
      const files = await fs.readdir(this.templateDir);

      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const templateName = path.basename(file, '.hbs');
          await this.loadTemplate(templateName);
        }
      }
    } catch (error) {
      logger.error(
        { err: error, templateDir: this.templateDir },
        'Failed to initialize email templates',
      );
      throw error;
    }
  }

  /**
   * Load a Handlebars template file by name, compile it into a TemplateDelegate, and cache the result for reuse.
   * @param name Base filename of the template (without the .hbs extension) to load and compile.
   */
  async loadTemplate(name: string): Promise<TemplateDelegate> {
    if (this.templates[name]) {
      return this.templates[name];
    }

    const templatePath = path.join(this.templateDir, `${name}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    this.templates[name] = handlebars.compile(templateContent);
    return this.templates[name];
  }

  /**
   * Send an HTML email rendered from a named Handlebars template to the specified recipient when email sending is enabled.
   * @param to Recipient email address (string).
   * @param subject Email subject line (string).
   * @param templateName Name of the Handlebars template to load and render (string).
   * @param data Template data object passed to the Handlebars template to produce the email HTML.
   */
  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    data: TemplateData,
  ): Promise<EmailInfo | void> {
    if (!config.app.emailEnabled) {
      logger.info('Email sending is disabled');
      return;
    }

    try {
      const template = await this.loadTemplate(templateName);
      const html = template(data);

      const mailOptions: MailOptions = {
        from: config.email.from,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info({ messageId: info.messageId }, 'Email sent');
      return info;
    } catch (error) {
      logger.error({ err: error }, 'Failed to send email');
      throw error;
    }
  }

  /**
   * Attempt to send the templated HTML email, retrying on failure with increasing delays between attempts.
   * @param to Recipient email address.
   * @param subject Email subject line.
   * @param templateName Name of the Handlebars template to render for the email body.
   * @param data Template data object used to render the template.
   * @param retries Maximum number of send attempts (default 3); on failure waits 1s × attempt before retrying and rethrows the last error if all attempts fail.
   */
  async sendEmailWithRetry(
    to: string,
    subject: string,
    templateName: string,
    data: TemplateData,
    retries = 3,
  ): Promise<EmailInfo | void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.sendEmail(to, subject, templateName, data);
      } catch (error) {
        logger.warn({ err: error, attempt }, 'Email attempt failed');
        if (attempt === retries) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}

export const emailService = new EmailService();
