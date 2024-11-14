const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
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

  async initializeTemplates() {
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

  async loadTemplate(name) {
    if (this.templates[name]) {
      return this.templates[name];
    }

    const templatePath = path.join(__dirname, './templates', `${name}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    this.templates[name] = handlebars.compile(templateContent);
    return this.templates[name];
  }

  async sendEmail(to, subject, templateName, data) {
    if (!config.app.emailEnabled) {
      logger.info('Email sending is disabled');
      return;
    }

    try {
      const template = await this.loadTemplate(templateName);
      const html = template(data);

      const mailOptions = {
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

  async sendEmailWithRetry(to, subject, templateName, data, retries = 3) {
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

  async validateTemplate(name) {
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

module.exports = new EmailService(); 