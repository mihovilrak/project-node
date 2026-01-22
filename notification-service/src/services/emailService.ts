import nodemailer from 'nodemailer';
import handlebars, { TemplateDelegate } from 'handlebars';
import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';
import {
  EmailService as IEmailService,
  EmailTemplates,
  MailOptions,
  EmailInfo,
} from '../types/email.types';

class EmailService implements IEmailService {
  public transporter: nodemailer.Transporter;
  public templates: EmailTemplates;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth,
    });

    this.templates = {};
    this.initializeTemplates();
  }

  async initializeTemplates(): Promise<void> {
    try {
      const templateDir = path.join(__dirname, '../templates');
      const files = await fs.readdir(templateDir);

      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const templateName = path.basename(file, '.hbs');
          await this.loadTemplate(templateName);
        }
      }
    } catch (error) {
      logger.error('Failed to initialize email templates:', error);
    }
  }

  async loadTemplate(name: string): Promise<TemplateDelegate> {
    if (this.templates[name]) {
      return this.templates[name];
    }

    const templatePath = path.join(__dirname, '../templates', `${name}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    this.templates[name] = handlebars.compile(templateContent);
    return this.templates[name];
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    data: any
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
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendEmailWithRetry(
    to: string,
    subject: string,
    templateName: string,
    data: any,
    retries = 3
  ): Promise<EmailInfo | void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.sendEmail(to, subject, templateName, data);
      } catch (error) {
        logger.warn(`Email attempt ${attempt} failed:`, error);
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async validateTemplate(name: string): Promise<boolean> {
    try {
      const template = await this.loadTemplate(name);
      template({});
      return true;
    } catch (error) {
      logger.error(`Template validation failed for ${name}:`, error);
      return false;
    }
  }
}

export const emailService = new EmailService();
