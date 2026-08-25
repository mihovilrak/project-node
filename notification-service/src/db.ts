import { Pool } from 'pg';
import { config } from './config';
import { logger } from './utils/logger';

const pool = new Pool({
  ...config.db,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err: Error) => {
  logger.error({ err }, 'Unexpected error on idle client');
  process.exit(1);
});

export { pool };
