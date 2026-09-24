import { Pool, PoolClient } from 'pg';
import logger from './logger';

// Anything a model can run a query against: the pool (autocommit) or a client
// already enlisted in a transaction.
export type Queryable = Pool | PoolClient;

/**
 * Execute a function within a database transaction that automatically commits on success or rolls back on error, ensuring the client is always released.
 *
 * The client is always released, even if rollback fails during error handling. Rollback failures are logged but do not suppress the original error.
 * @param pool A PostgreSQL connection pool from which a dedicated client will be obtained.
 * @param fn An async function receiving the transaction client and returning a result of type T.
 */
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
