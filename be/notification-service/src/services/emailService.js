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
  }

  async loadTemplate(name) {
    if (this.templates[name]) {
      return this.templates[name];
    }

    const templatePath = path.join(__dirname, '../templates', `${name}.hbs`);
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
}

module.exports = new EmailService(); 