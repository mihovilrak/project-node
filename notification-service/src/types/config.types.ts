export interface DbConfig {
  user: string | undefined;
  host: string | undefined;
  database: string | undefined;
  password: string | undefined;
  port: number;
}

export interface EmailAuth {
  user: string | undefined;
  pass: string | undefined;
}

/**
 * Configure the SMTP/email transport (host, port, TLS usage), authentication credentials, and default sender address used for application emails.
 */
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: EmailAuth;
  from: string;
}

export interface AppConfig {
  nodeEnv: string;
  emailEnabled: boolean;
  port: number;
}

export interface Config {
  db: DbConfig;
  email: EmailConfig;
  appBaseUrl: string;
  app: AppConfig;
}

/**
 * Represent the runtime-editable half of app_settings shared with the API, containing the database row fields sender_email, app_base_url, email_enabled, email_host, email_port, and email_secure.
 */
export interface AppSettingsRow {
  sender_email: string;
  app_base_url: string;
  email_enabled: boolean;
  email_host: string;
  email_port: number;
  email_secure: boolean;
}
