import { Pool, PoolClient } from 'pg';
import { setActor, withTransaction } from '../transaction';
import logger from '../logger';

jest.mock('../logger', () => ({
  __esModule: true,
  default: { error: jest.fn() },
}));

describe('withTransaction', () => {
  let client: { query: jest.Mock; release: jest.Mock };
  let pool: Pool;

  beforeEach(() => {
    client = { query: jest.fn().mockResolvedValue({}), release: jest.fn() };
    pool = { connect: jest.fn().mockResolvedValue(client) } as unknown as Pool;
    jest.clearAllMocks();
  });

  const statements = () => client.query.mock.calls.map((c) => c[0]);

  it('commits and returns the result', async () => {
    const result = await withTransaction(pool, async () => 42);

    expect(result).toBe(42);
    expect(statements()).toEqual(['BEGIN', 'COMMIT']);
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it('rolls back and rethrows on failure', async () => {
    await expect(
      withTransaction(pool, async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect(statements()).toEqual(['BEGIN', 'ROLLBACK']);
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it('keeps the original error when rollback fails', async () => {
    client.query.mockImplementation(async (sql: string) => {
      if (sql === 'ROLLBACK') throw new Error('rollback failed');
      return {};
    });

    await expect(
      withTransaction(pool, async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect(logger.error).toHaveBeenCalled();
    expect(client.release).toHaveBeenCalledTimes(1);
  });
});

describe('setActor', () => {
  it('sets app.user_id for the current transaction only', async () => {
    const client = { query: jest.fn().mockResolvedValue({}) };

    await setActor(client as unknown as PoolClient, 5);

    expect(client.query).toHaveBeenCalledWith(
      `SELECT set_config('app.user_id', $1, true)`,
      ['5'],
    );
  });
});
