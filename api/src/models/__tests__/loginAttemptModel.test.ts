import { Pool } from 'pg';
import type { Options } from 'express-rate-limit';
import {
  PgRateLimitStore,
  clearFailedLogins,
  getAccountLock,
  recordFailedLogin,
} from '../loginAttemptModel';

describe('loginAttemptModel', () => {
  let pool: { query: jest.Mock };

  beforeEach(() => {
    pool = { query: jest.fn().mockResolvedValue({ rows: [] }) };
  });

  describe('PgRateLimitStore', () => {
    it('upserts the prefixed key with the configured window', async () => {
      const resetAt = new Date();
      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ hits: 3, reset_at: resetAt }] });
      const store = new PgRateLimitStore(pool as unknown as Pool);
      store.init({ windowMs: 1000 } as Options);

      const info = await store.increment('1.2.3.4');

      expect(pool.query.mock.calls[0][0]).toContain(
        'DELETE FROM login_attempts',
      );
      expect(pool.query.mock.calls[1][1]).toEqual(['ip:1.2.3.4', 1000]);
      expect(info).toEqual({ totalHits: 3, resetTime: resetAt });
    });

    it('cleans up expired rows at most once per interval', async () => {
      pool.query.mockResolvedValue({
        rows: [{ hits: 1, reset_at: new Date() }],
      });
      const store = new PgRateLimitStore(pool as unknown as Pool);

      await store.increment('a');
      await store.increment('a');

      const deletes = pool.query.mock.calls.filter(([sql]) =>
        String(sql).startsWith('DELETE'),
      );
      expect(deletes).toHaveLength(1);
    });

    it('returns undefined from get when no window is open', async () => {
      const store = new PgRateLimitStore(pool as unknown as Pool);
      await expect(store.get('a')).resolves.toBeUndefined();
    });

    it('decrements and resets the prefixed key', async () => {
      const store = new PgRateLimitStore(pool as unknown as Pool);
      await store.decrement('a');
      await store.resetKey('a');
      expect(pool.query.mock.calls[0][1]).toEqual(['ip:a']);
      expect(pool.query.mock.calls[1][1]).toEqual(['ip:a']);
    });
  });

  describe('account backoff', () => {
    it('returns null when the account is not locked', async () => {
      await expect(
        getAccountLock(pool as unknown as Pool, 'bob'),
      ).resolves.toBeNull();
      expect(pool.query.mock.calls[0][1]).toEqual(['account:bob', 5]);
    });

    it('returns the remaining lock time', async () => {
      pool.query.mockResolvedValue({ rows: [{ retry_after: 12 }] });
      await expect(
        getAccountLock(pool as unknown as Pool, 'bob'),
      ).resolves.toBe(12);
    });

    it('records and clears failures under the account key', async () => {
      await recordFailedLogin(pool as unknown as Pool, 'bob');
      await clearFailedLogins(pool as unknown as Pool, 'bob');
      expect(pool.query.mock.calls[0][1]).toEqual(['account:bob', 5, 30, 900]);
      expect(pool.query.mock.calls[1][1]).toEqual(['account:bob']);
    });
  });
});
