import { pool } from './db';
import { applySettings, config } from './config';
import { logger } from './utils/logger';
import { AppSettingsRow } from './types/config.types';

const QUERY = `SELECT sender_email, app_base_url, email_enabled, email_host, email_port, email_secure
               FROM app_settings WHERE id = 1`;

let warnedAboutCredentials = false;

/**
 * Reload application settings from the database before each batch so admin-UI changes take effect without restarting the container.
 *
 * Queries the database for the single application settings row and applies it via applySettings(row). On a query error it logs the failure and returns false, keeping the current in-memory settings. After applying settings it updates a module-level warnedAboutCredentials flag: if email is enabled in settings but EMAIL_USER/EMAIL_PASSWORD are not set it logs a one-time warning and sets warnedAboutCredentials to true; otherwise it clears that flag. The function mutates module-level configuration state and returns a boolean indicating whether any settings were changed; callers use that return value to decide (for example) whether to refresh the email transport.
 */
export const reloadSettings = async (): Promise<boolean> => {
  let row: AppSettingsRow | null = null;
  try {
    const result = await pool.query<AppSettingsRow>(QUERY);
    row = result.rows[0] ?? null;
  } catch (err) {
    logger.error(
      { err },
      'Failed to load app settings; keeping current values',
    );
    return false;
  }

  const changed = applySettings(row);

  if (config.app.emailEnabled && !config.email.auth.pass) {
    if (!warnedAboutCredentials) {
      logger.warn(
        'Email is enabled in settings but EMAIL_USER/EMAIL_PASSWORD are not set',
      );
      warnedAboutCredentials = true;
    }
  } else {
    warnedAboutCredentials = false;
  }

  return changed;
};
