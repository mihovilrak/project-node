import path from 'path';
import dotenv from 'dotenv';
import { Config } from './types/config';
import logger from './utils/logger';

// When running integration tests under Jest, load .env.test first so the app uses the test DB
if (process.env.JEST_WORKER_ID !== undefined) {
  dotenv.config({ path: path.join(process.cwd(), '.env.test') });
}
// Load environment variables from .env file (does not override existing vars)
dotenv.config();

// Use TEST_DB_* when set (e.g. CI integration tests) so the app connects to the same DB as tests
const dbHost = process.env.TEST_DB_HOST || 'db';
const dbPort = process.env.TEST_DB_PORT || '5432';
const dbUser = process.env.TEST_DB_USER || process.env.POSTGRES_USER || 'pm_user';
const dbPassword = process.env.TEST_DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'pm_password';
const dbName = process.env.TEST_DB_NAME || process.env.POSTGRES_DB || 'pm_test';

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`,
  sessionSecret: process.env.SESSION_SECRET || 'default_secret',
  feUrl: process.env.FE_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development'
};

function validateConfig(): void {
  const { nodeEnv, sessionSecret, databaseUrl, port, feUrl } = config;

  if (!Number.isFinite(port) || port <= 0) {
    logger.error('Config validation failed: PORT must be a valid positive number.');
    process.exit(1);
  }

  if (databaseUrl.includes('undefined')) {
    logger.error('Config validation failed: database URL contains undefined. Set POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB (or TEST_DB_* for tests).');
    process.exit(1);
  }

  if (nodeEnv === 'production') {
    if (!process.env.SESSION_SECRET || sessionSecret === 'default_secret') {
      logger.error('Config validation failed: SESSION_SECRET must be set to a non-default value in production.');
      process.exit(1);
    }
    if (!process.env.FE_URL || !feUrl || typeof feUrl !== 'string' || feUrl.trim() === '') {
      logger.error('Config validation failed: FE_URL must be set in production.');
      process.exit(1);
    }
  }
}

validateConfig();

export default config;
