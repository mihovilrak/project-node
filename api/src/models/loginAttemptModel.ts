import type { Options, Store, ClientRateLimitInfo } from 'express-rate-limit';
import { Pool } from 'pg';

const FREE_ATTEMPTS = 5;
const BASE_LOCK_SECONDS = 30;
const MAX_LOCK_SECONDS = 15 * 60;
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

const accountKey = (login: string) => `account:${login}`;

/**
 * express-rate-limit store backed by the login_attempts table, so the limit is
 * shared by every API instance and survives restarts.
 */
export class PgRateLimitStore implements Store {
  prefix = 'ip:';
  localKeys = false;
  private windowMs = 60_000;
  private lastCleanup = 0;

  constructor(private readonly pool: Pool) {}

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const { rows } = await this.pool.query(
      `SELECT hits, reset_at FROM login_attempts
       WHERE key = $1 AND reset_at > now()`,
      [this.prefix + key],
    );
    return rows[0]
      ? { totalHits: rows[0].hits, resetTime: rows[0].reset_at }
      : undefined;
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    await this.cleanup();
    const { rows } = await this.pool.query(
      `INSERT INTO login_attempts AS la (key, hits, reset_at)
       VALUES ($1, 1, now() + $2 * interval '1 millisecond')
       ON CONFLICT (key) DO UPDATE SET
         hits = CASE WHEN la.reset_at <= now() THEN 1 ELSE la.hits + 1 END,
         reset_at = CASE WHEN la.reset_at <= now() THEN excluded.reset_at ELSE la.reset_at END
       RETURNING hits, reset_at`,
      [this.prefix + key, this.windowMs],
    );
    return { totalHits: rows[0].hits, resetTime: rows[0].reset_at };
  }

  async decrement(key: string): Promise<void> {
    await this.pool.query(
      `UPDATE login_attempts SET hits = greatest(hits - 1, 0) WHERE key = $1`,
      [this.prefix + key],
    );
  }

  async resetKey(key: string): Promise<void> {
    await this.pool.query(`DELETE FROM login_attempts WHERE key = $1`, [
      this.prefix + key,
    ]);
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCleanup < CLEANUP_INTERVAL_MS) return;
    this.lastCleanup = now;
    await this.pool.query(
      `DELETE FROM login_attempts WHERE reset_at < now() - interval '1 hour'`,
    );
  }
}

/**
 * Seconds until the account may try again, or null when it is not locked.
 * @param pool Database connection pool
 * @param login The submitted login name
 */
export const getAccountLock = async (
  pool: Pool,
  login: string,
): Promise<number | null> => {
  const { rows } = await pool.query(
    `SELECT ceil(extract(epoch FROM reset_at - now()))::int AS retry_after
     FROM login_attempts
     WHERE key = $1 AND hits >= $2 AND reset_at > now()`,
    [accountKey(login), FREE_ATTEMPTS],
  );
  return rows[0] ? Math.max(1, rows[0].retry_after) : null;
};

/**
 * Counts a failed login. After FREE_ATTEMPTS failures the account is locked for
 * an exponentially growing period, capped at MAX_LOCK_SECONDS. The counter
 * starts over after an hour without failures.
 * @param pool Database connection pool
 * @param login The submitted login name
 */
export const recordFailedLogin = async (
  pool: Pool,
  login: string,
): Promise<void> => {
  await pool.query(
    `INSERT INTO login_attempts AS la (key, hits, reset_at)
     VALUES ($1, 1, now())
     ON CONFLICT (key) DO UPDATE SET
       hits = CASE WHEN la.reset_at < now() - interval '1 hour' THEN 1 ELSE la.hits + 1 END,
       reset_at = now() + CASE
         WHEN la.reset_at >= now() - interval '1 hour' AND la.hits + 1 >= $2
         THEN least($4, $3 * power(2, least(la.hits + 1 - $2, 10))) * interval '1 second'
         ELSE interval '0'
       END`,
    [accountKey(login), FREE_ATTEMPTS, BASE_LOCK_SECONDS, MAX_LOCK_SECONDS],
  );
};

/**
 * Clears the failure counter after a successful login.
 * @param pool Database connection pool
 * @param login The login name
 */
export const clearFailedLogins = async (
  pool: Pool,
  login: string,
): Promise<void> => {
  await pool.query(`DELETE FROM login_attempts WHERE key = $1`, [
    accountKey(login),
  ]);
};
