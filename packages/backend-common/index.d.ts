import { Logger } from 'pino';
import { Pool, PoolConfig } from 'pg';

export interface DatabaseConfig {
  host: string | undefined;
  port: number;
  user: string | undefined;
  password: string | undefined;
  database: string | undefined;
}

export interface DatabaseDefaults {
  preferTest?: boolean;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export interface EmailSettings {
  email_host?: string | null;
  email_port?: number | null;
  email_secure?: boolean | null;
  sender_email?: string | null;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string | undefined;
    pass: string | undefined;
  };
  from: string;
}

export function createLogger(env?: NodeJS.ProcessEnv): Logger;
export function readSecret(
  env: NodeJS.ProcessEnv,
  name: string,
): string | undefined;
export function readDatabaseConfig(
  env?: NodeJS.ProcessEnv,
  options?: DatabaseDefaults,
): DatabaseConfig;
export function validateDatabaseConfig(database: DatabaseConfig): void;
export function buildEmailConfig(
  settings: EmailSettings | null,
  env?: NodeJS.ProcessEnv,
): SmtpConfig;
export function createPool(
  database: PoolConfig,
  logger: Logger,
  overrides?: PoolConfig,
): Pool;
