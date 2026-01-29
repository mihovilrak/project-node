import path from 'path';
import dotenv from 'dotenv';
import { Config } from './types/config';

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
  feUrl: 'http://localhost',
  nodeEnv: process.env.NODE_ENV || 'development'
};

export default config;
