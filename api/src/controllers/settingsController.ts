import { Request, Response } from 'express';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import * as settingsModel from '../models/settingsModel';
import { CustomRequest } from '../types/express';
import { SettingsUpdateInput } from '../types/settings';

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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error('SMTP test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false, 
      message: `SMTP test failed: ${errorMessage}` 
    });
  }
};
