import { Pool } from 'pg';
import { deleteUserSessions } from '../sessionModel';

describe('sessionModel.deleteUserSessions', () => {
  const query = jest.fn();
  const pool = { query } as unknown as Pool;

  it('deletes every session of the user', async () => {
    query.mockResolvedValueOnce({ rowCount: 3 });

    await expect(deleteUserSessions(pool, '5')).resolves.toBe(3);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('DELETE'), [
      '5',
      null,
    ]);
  });

  it('keeps the excepted session', async () => {
    query.mockResolvedValueOnce({ rowCount: null });

    await expect(deleteUserSessions(pool, '5', 'sid-1')).resolves.toBe(0);
    expect(query).toHaveBeenCalledWith(expect.any(String), ['5', 'sid-1']);
  });
});
