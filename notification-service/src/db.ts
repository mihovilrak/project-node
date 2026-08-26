import { Pool } from 'pg';
import { config } from './config';
import { logger } from './utils/logger';

const pool = new Pool({
  ...config.db,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// An idle-client error is recoverable - the pool discards that client and opens
// a new one on the next query. Exiting instead stopped notifications forever,
// because nothing supervises this process.
pool.on('error', (err: Error) => {
  logger.error({ err }, 'Unexpected error on idle client');
});

export { pool };
