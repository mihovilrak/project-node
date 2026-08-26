import { Pool, PoolClient } from 'pg';
import logger from './logger';

// Anything a model can run a query against: the pool (autocommit) or a client
// already enlisted in a transaction.
export type Queryable = Pool | PoolClient;

// Runs fn on a dedicated client wrapped in BEGIN/COMMIT, rolling back on any
// throw. The client is always released.
export const withTransaction = async <T>(
  pool: Pool,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error({ err: rollbackError }, 'Transaction rollback failed');
    }
    throw error;
  } finally {
    client.release();
  }
};
