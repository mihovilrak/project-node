import { Request, Response } from 'express';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import * as settingsModel from '../models/settingsModel';
import { CustomRequest } from '../types/express';
import {
  SettingsUpdateInput,
  UserSettingsUpdateInput,
} from '../types/settings';
import logger from '../utils/logger';
import { sessionUserId } from '../utils/sessionUser';
import { buildEmailConfig } from '../config';

// Get System Settings
export const getSystemSettings = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const settings = await settingsModel.getSystemSettings(pool);
  res.status(200).json(settings);
};

/**
 * Returns the welcome message shown on the home page to any signed-in user.
 *
 * @param req Express request object
 * @param res Express response with `{ welcome_message }`
 * @param pool Database connection pool
 */
export const getWelcomeMessage = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const welcome_message = await settingsModel.getWelcomeMessage(pool);
  res.status(200).json({ welcome_message });
};

/**
 * Retrieve all available timezones with in-memory caching.
 *
 * Results are cached in memory to avoid repeated database queries.
 *
 * @param req Express request object
 * @param res Express response object for sending the timezone list
 * @param pool PostgreSQL connection pool for database access
 */
export const getTimezones = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const timezones = await settingsModel.getTimezones(pool);
  res.status(200).json(timezones);
};

/**
 * Retrieve the application theme setting as a public endpoint requiring no
 * authentication.
 *
 * Returns the configured theme value or defaults to 'light' if no theme is set.
 * This endpoint is accessible without admin permissions.
 *
 * @param req Express request object
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getAppTheme = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const settings = await settingsModel.getSystemSettings(pool);
  res.status(200).json({ theme: settings?.theme || 'light' });
};

const LOG_LEVELS = ['error', 'warn', 'info', 'debug'];
const THEMES = ['light', 'dark', 'system'];
const MAX_SETTING_LENGTH = 255;
const MAX_WELCOME_MESSAGE_LENGTH = 20000;

// Fields the admin UI can change that alter how the app behaves at runtime,
// rather than only how it looks. Kept separate so they can be audit-logged.
const RUNTIME_KEYS = [
  'app_base_url',
  'log_level',
  'email_enabled',
  'email_host',
  'email_port',
  'email_secure',
  'sender_email',
] as const;

const REQUIRED_STRING_KEYS = [
  'app_name',
  'company_name',
  'sender_email',
  'time_zone',
  'app_base_url',
  'email_host',
] as const;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function validateSettings(input: Record<string, unknown>): string | null {
  for (const key of REQUIRED_STRING_KEYS) {
    const value = input[key];
    if (value === undefined) continue;
    if (typeof value !== 'string' || value.trim() === '') {
      return `${key} cannot be empty`;
    }
    if (value.length > MAX_SETTING_LENGTH) {
      return `${key} must be at most ${MAX_SETTING_LENGTH} characters`;
    }
  }
  if (
    input.welcome_message !== undefined &&
    (typeof input.welcome_message !== 'string' ||
      input.welcome_message.length > MAX_WELCOME_MESSAGE_LENGTH)
  ) {
    return `welcome_message must be text of at most ${MAX_WELCOME_MESSAGE_LENGTH} characters`;
  }
  if (
    input.log_level !== undefined &&
    !LOG_LEVELS.includes(input.log_level as string)
  ) {
    return `log_level must be one of: ${LOG_LEVELS.join(', ')}`;
  }
  if (input.email_port !== undefined) {
    const port = Number(input.email_port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return 'email_port must be a number between 1 and 65535';
    }
  }
  for (const key of ['email_enabled', 'email_secure'] as const) {
    if (input[key] !== undefined && typeof input[key] !== 'boolean') {
      return `${key} must be true or false`;
    }
  }
  if (input.theme !== undefined && !THEMES.includes(input.theme as string)) {
    return `theme must be one of: ${THEMES.join(', ')}`;
  }
  return null;
}

function validateUserSettings(input: Record<string, unknown>): string | null {
  if (input.theme !== undefined && !THEMES.includes(input.theme as string)) {
    return `theme must be one of: ${THEMES.join(', ')}`;
  }
  if (
    input.language !== undefined &&
    (typeof input.language !== 'string' ||
      !/^[a-z]{2}(-[A-Z]{2})?$/.test(input.language))
  ) {
    return 'language must be a language code such as en or en-US';
  }
  for (const key of [
    'notifications_enabled',
    'email_notifications_enabled',
    'email_notifications',
  ]) {
    if (input[key] !== undefined && typeof input[key] !== 'boolean') {
      return `${key} must be true or false`;
    }
  }
  return null;
}

/**
 * Persist application-wide settings changes to the database while validating
 * input and logging sensitive runtime configuration updates.
 *
 * Validates incoming settings before persisting and returns 400 on invalid
 * input. When runtime keys such as SMTP or public base URL are modified, logs
 * the change with actor identity, originating IP address, and before/after
 * values for audit purposes.
 *
 * @param req The request object containing user session context and settings
 *   payload in the body
 * @param res The response object used to send the persisted settings or error
 *   details
 * @param pool The database connection pool
 */
export const updateSystemSettings = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const body = req.body ?? {};
  if (!isPlainObject(body)) {
    return res.status(400).json({ error: 'Settings must be an object' });
  }
  const invalid = validateSettings(body);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }
  const input = body as SettingsUpdateInput;

  const changedRuntimeKeys = RUNTIME_KEYS.filter(
    (key) => input[key] !== undefined,
  );
  if (changedRuntimeKeys.length > 0) {
    const previous = await settingsModel.getSystemSettings(pool);
    // Changing SMTP or the public base URL over HTTP has a wide blast radius,
    // so every write leaves a trail naming the actor and the before/after value.
    logger.warn(
      {
        actor: {
          id: req.session?.user?.id,
          login: req.session?.user?.login,
        },
        ip: req.ip,
        changes: changedRuntimeKeys.map((key) => ({
          key,
          from: previous?.[key] ?? null,
          to: input[key],
        })),
      },
      'Runtime settings updated',
    );
  }

  const settings = await settingsModel.updateSystemSettings(pool, input);
  res.status(200).json(settings);
};

/**
 * Retrieve the authenticated user's application settings from the database.
 *
 * Returns an empty object if no settings exist for the user.
 *
 * @param req Express request with session containing authenticated user ID
 * @param res Express response object for sending the settings data
 * @param pool Database connection pool
 */
export const getUserSettings = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const settings = await settingsModel.getUserSettings(
    pool,
    sessionUserId(req),
  );
  res.status(200).json(settings || {});
};

/**
 * Update the authenticated user's settings and return the persisted
 * configuration.
 *
 * Omitted fields in the request body fall back to existing values. Returns 400
 * when a value has the wrong type.
 *
 * @param req The HTTP request object with session data containing user
 *   authentication.
 * @param res The HTTP response object for sending JSON responses.
 * @param pool The database connection pool for accessing the settings model.
 */
export const updateUserSettings = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const userId = sessionUserId(req);
  const body = req.body ?? {};
  if (!isPlainObject(body)) {
    return res.status(400).json({ error: 'Settings must be an object' });
  }
  const invalid = validateUserSettings(body);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }
  const settings = await settingsModel.updateUserSettings(
    pool,
    userId,
    body as UserSettingsUpdateInput,
  );
  res.status(200).json(settings);
};

/**
 * Verify SMTP configuration by sending a test email to a supplied address.
 *
 * Requires email to be enabled in system settings and validates the email
 * address format before attempting to connect and send. Returns only an error
 * code in the response while logging full details server-side.
 *
 * @param req HTTP request containing the email address to test in the request
 *   body
 * @param res HTTP response object
 * @param pool Database connection pool
 */
export const testSmtpConnection = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const email = req.body?.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      typeof email !== 'string' ||
      email.length > MAX_SETTING_LENGTH ||
      !emailRegex.test(email)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format',
      });
    }

    const emailConfig = buildEmailConfig(
      await settingsModel.getSystemSettings(pool),
    );

    if (!emailConfig.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Email sending is disabled. Enable it in System Settings.',
      });
    }

    // Create transporter with environment config
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });

    // First verify the connection
    await transporter.verify();

    // Send test email
    const info = await transporter.sendMail({
      from: emailConfig.from,
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
      messageId: info.messageId,
    });
  } catch (error) {
    logger.error({ err: error }, 'SMTP test failed');
    // The raw SMTP error names the host, port and auth outcome; return only the
    // transport's short code and keep the detail in the server log.
    const code = (error as { code?: string })?.code;
    res.status(500).json({
      success: false,
      message: 'SMTP test failed. See the server logs for details.',
      ...(typeof code === 'string' && { code }),
    });
  }
};
