import { Pool } from 'pg';
import config from './config';
import logger from './utils/logger';

export const pool: Pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500,
});

pool.on('error', (err: Error) => {
  logger.error({ err }, 'Unexpected error on idle client');
});

export async function ensureConnection(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    logger.info('Connected to database successfully');
  } catch (err) {
    logger.error({ err }, 'Error connecting to the database');
    process.exit(1);
  }
}
