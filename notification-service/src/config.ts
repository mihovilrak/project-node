import { AppSettingsRow, Config, EmailConfig } from './types/config.types';
import {
  buildEmailConfig,
  readDatabaseConfig,
  validateDatabaseConfig,
} from '@pm/backend-common';

const DEFAULT_BASE_URL = 'http://localhost:3000';

export const config: Config = {
  db: { ...readDatabaseConfig() },
  // Credentials (EMAIL_USER, EMAIL_PASSWORD or EMAIL_PASSWORD_FILE) are
  // secrets and stay in the environment; everything else is editable from the
  // admin UI and lives in app_settings.
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

// `from` is read on every send, so only these fields require a new transport.
const sameTransport = (a: EmailConfig, b: EmailConfig): boolean =>
  a.host === b.host &&
  a.port === b.port &&
  a.secure === b.secure &&
  a.auth.user === b.auth.user &&
  a.auth.pass === b.auth.pass;

/**
 * Apply the given application settings to the global config and return true
 * when the SMTP connection parameters (host, port, secure, credentials)
 * changed, so the mail transporter must be rebuilt.
 *
 * Side effects: replaces config.email, sets config.app.emailEnabled from
 * settings?.email_enabled (default false), and sets config.appBaseUrl from
 * settings?.app_base_url or DEFAULT_BASE_URL with trailing slashes stripped. A
 * null settings row resets everything to the defaults.
 *
 * @param settings The app_settings row to apply, or null.
 */
export const applySettings = (settings: AppSettingsRow | null): boolean => {
  const next = buildEmailConfig(settings);
  const changed = !sameTransport(next, config.email);
  config.email = next;
  config.app.emailEnabled = settings?.email_enabled ?? false;
  config.appBaseUrl = (settings?.app_base_url || DEFAULT_BASE_URL).replace(
    /\/+$/,
    '',
  );
  return changed;
};

/**
 * Verify the resolved database settings (including a password read from
 * POSTGRES_PASSWORD_FILE) and throw an Error listing any that are missing.
 */
export function validateConfig(): void {
  validateDatabaseConfig(config.db);
}
