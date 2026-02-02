import { Request, Response } from 'express';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as settingsModel from '../models/settingsModel';
import { CustomRequest } from '../types/express';
import { SettingsUpdateInput } from '../types/settings';
import logger from '../utils/logger';

// Get System Settings
export const getSystemSettings = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const settings = await settingsModel.getSystemSettings(pool);
    res.status(200).json(settings);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get App Theme (public endpoint, no admin permission required)
export const getAppTheme = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const settings = await settingsModel.getSystemSettings(pool);
    if (!settings) {
      return res.status(200).json({ theme: 'light' });
    }
    res.status(200).json({ theme: settings.theme || 'light' });
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update System Settings
export const updateSystemSettings = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const settings = await settingsModel.updateSystemSettings(pool, req.body as SettingsUpdateInput);
    res.status(200).json(settings);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get User Settings
export const getUserSettings = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const settings = await settingsModel.getUserSettings(pool, userId);
    res.status(200).json(settings || {});
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update User Settings
export const updateUserSettings = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const settings = await settingsModel.updateUserSettings(pool, userId, req.body as SettingsUpdateInput);
    res.status(200).json(settings);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Allowed env keys to expose. Secrets are masked and not editable.
const ALLOWED_ENV_KEYS = ['NODE_ENV', 'PORT', 'FE_URL', 'LOG_LEVEL', 'EMAIL_ENABLED', 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_FROM'];
const EDITABLE_ENV_KEYS = ['PORT', 'FE_URL', 'LOG_LEVEL', 'EMAIL_ENABLED', 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_FROM'];
const SECRET_PATTERNS = /PASSWORD|SECRET|KEY|TOKEN|CREDENTIAL/i;
const LOG_LEVELS = ['error', 'warn', 'info', 'debug'];

function validateEnvValue(key: string, value: string): { valid: boolean; message?: string } {
  if (value === undefined || value === null) {
    return { valid: false, message: 'Value is required' };
  }
  const v = String(value).trim();
  switch (key) {
    case 'PORT': {
      const num = parseInt(v, 10);
      if (Number.isNaN(num) || num < 1 || num > 65535) {
        return { valid: false, message: 'PORT must be a number between 1 and 65535' };
      }
      return { valid: true };
    }
    case 'LOG_LEVEL':
      if (!LOG_LEVELS.includes(v.toLowerCase())) {
        return { valid: false, message: `LOG_LEVEL must be one of: ${LOG_LEVELS.join(', ')}` };
      }
      return { valid: true };
    case 'EMAIL_PORT': {
      const num = parseInt(v, 10);
      if (Number.isNaN(num) || num < 1 || num > 65535) {
        return { valid: false, message: 'EMAIL_PORT must be a number between 1 and 65535' };
      }
      return { valid: true };
    }
    case 'EMAIL_ENABLED':
      if (v !== 'true' && v !== 'false') {
        return { valid: false, message: 'EMAIL_ENABLED must be true or false' };
      }
      return { valid: true };
    case 'FE_URL':
    case 'EMAIL_HOST':
    case 'EMAIL_FROM':
      if (v.length === 0) {
        return { valid: false, message: `${key} cannot be empty` };
      }
      return { valid: true };
    default:
      return { valid: true };
  }
}

function getEnvFilePath(): string {
  return process.env.ENV_FILE_PATH || path.join(process.cwd(), '.env');
}

function readEnvFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return out;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      out[key] = value;
    }
  }
  return out;
}

function writeEnvFile(filePath: string, data: Record<string, string>): void {
  const lines: string[] = [];
  const keys = Object.keys(data).sort();
  for (const key of keys) {
    const value = data[key];
    const needsQuote = /[\s#="']/.test(value);
    lines.push(`${key}=${needsQuote ? `"${value.replace(/"/g, '\\"')}"` : value}`);
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8');
}

export const getEnvSettings = async (
  req: Request,
  res: Response,
  _pool: Pool
): Promise<Response | void> => {
  try {
    const entries: { key: string; value: string; masked: boolean }[] = [];
    for (const key of ALLOWED_ENV_KEYS) {
      const value = process.env[key];
      const masked = SECRET_PATTERNS.test(key) || !value;
      entries.push({
        key,
        value: masked ? '****' : (value ?? ''),
        masked
      });
    }
    res.status(200).json(entries);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEnvSettings = async (
  req: Request,
  res: Response,
  _pool: Pool
): Promise<Response | void> => {
  try {
    const body = req.body as { updates?: Record<string, string> };
    const updates = body?.updates && typeof body.updates === 'object' ? body.updates : {};
    const filePath = getEnvFilePath();

    for (const key of Object.keys(updates)) {
      if (!EDITABLE_ENV_KEYS.includes(key)) {
        return res.status(400).json({ error: `Key "${key}" is not editable` });
      }
      const value = String(updates[key] ?? '').trim();
      const validation = validateEnvValue(key, value);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.message || 'Invalid value' });
      }
    }

    const current = readEnvFile(filePath);
    for (const [key, value] of Object.entries(updates)) {
      current[key] = String(value).trim();
    }
    writeEnvFile(filePath, current);

    for (const [key, value] of Object.entries(updates)) {
      process.env[key] = value;
    }

    const entries: { key: string; value: string; masked: boolean }[] = [];
    for (const k of ALLOWED_ENV_KEYS) {
      const value = process.env[k];
      const masked = SECRET_PATTERNS.test(k) || !value;
      entries.push({
        key: k,
        value: masked ? '****' : (value ?? ''),
        masked
      });
    }
    res.status(200).json(entries);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Test SMTP Connection
export const testSmtpConnection = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email address format' 
      });
    }

    // Check if email is enabled
    if (process.env.EMAIL_ENABLED !== 'true') {
      return res.status(400).json({ 
        success: false, 
        message: 'Email sending is disabled. Set EMAIL_ENABLED=true in environment.' 
      });
    }

    // Create transporter with environment config
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // First verify the connection
    await transporter.verify();

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Project Management <noreply@example.com>',
      to: email,
      subject: 'SMTP Test - Project Management App',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4caf50; padding: 20px; text-align: center; color: white; }
            .content { padding: 20px; }
            .success { color: #4caf50; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>SMTP Test Successful</h2>
            </div>
            <div class="content">
              <p class="success">&#10004; Your SMTP configuration is working correctly!</p>
              <p>This is a test email from your Project Management application.</p>
              <p>If you received this email, your email notifications are properly configured.</p>
              <hr>
              <p><small>Sent at: ${new Date().toISOString()}</small></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.status(200).json({ 
      success: true, 
      message: `Test email sent successfully to ${email}`,
      messageId: info.messageId
    });
  } catch (error) {
    logger.error({ err: error }, 'SMTP test failed');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false, 
      message: `SMTP test failed: ${errorMessage}` 
    });
  }
};
