import { AppSettingsRow, Config, EmailConfig } from './types/config.types';
import { readDatabaseConfig } from '@pm/backend-common';

const DEFAULT_EMAIL_PORT = 587;
const DEFAULT_BASE_URL = 'http://localhost:3000';

const buildEmailConfig = (settings: AppSettingsRow | null): EmailConfig => ({
  host: settings?.email_host || 'smtp.gmail.com',
  port: settings?.email_port || DEFAULT_EMAIL_PORT,
  secure: settings?.email_secure ?? false,
  // Credentials are secrets, so they stay in the environment; everything else
  // is editable from the admin UI and lives in app_settings.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  from: settings?.sender_email || 'no-reply@example.com',
});

export const config: Config = {
  db: { ...readDatabaseConfig() },
  email: buildEmailConfig(null),
  // Links in notifications are opened by the user's browser, so they must point
  // at the app's public URL, not at this service's own port.
  appBaseUrl: DEFAULT_BASE_URL,
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    emailEnabled: false,
    port: parseInt(process.env.PORT || '5001', 10),
  },
};

/**
 * Apply the given application settings to the global config, normalizing the base URL and email-enabled flag, and return true when the SMTP/email connection parameters changed such that the mail transporter must be rebuilt.
 *
 * Side effects: updates config.email to the value produced by buildEmailConfig(settings), sets config.app.emailEnabled from settings?.email_enabled (default false), and normalizes config.appBaseUrl from settings?.app_base_url or DEFAULT_BASE_URL by stripping trailing slashes. Change detection is performed by comparing JSON.stringify(next) to the previous JSON.stringify(config.email); the function returns true iff those serialized values differ. If settings is null, buildEmailConfig and the defaults are used. Note: using JSON.stringify for equality means differences in serialization (field order, presence of undefined) affect change detection.
 * @param settings AppSettingsRow | null — the settings row to apply (may be null). The function reads email_host, email_port, email_secure, sender_email, email_enabled, and app_base_url (via buildEmailConfig and direct assignment) to update the global configuration.
 */
export const applySettings = (settings: AppSettingsRow | null): boolean => {
  const next = buildEmailConfig(settings);
  const changed = JSON.stringify(next) !== JSON.stringify(config.email);
  config.email = next;
  config.app.emailEnabled = settings?.email_enabled ?? false;
  config.appBaseUrl = (settings?.app_base_url || DEFAULT_BASE_URL).replace(
    /\/+$/,
    '',
  );
  return changed;
};

/**
 * Verify that required PostgreSQL environment variables are set and throw an Error listing any that are missing.
 */
export function validateConfig(): void {
  const missing: string[] = [];
  if (!process.env.POSTGRES_HOST) missing.push('POSTGRES_HOST');
  if (!process.env.POSTGRES_USER) missing.push('POSTGRES_USER');
  if (!process.env.POSTGRES_DB) missing.push('POSTGRES_DB');
  if (!process.env.POSTGRES_PASSWORD) missing.push('POSTGRES_PASSWORD');
  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(', ')}`);
  }
}
