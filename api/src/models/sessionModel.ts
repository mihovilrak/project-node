import { Queryable } from '../utils/transaction';

/**
 * Deletes every stored session of a user, optionally keeping one.
 *
 * @param pool - Database pool or transaction client.
 * @param userId - The user whose sessions are removed.
 * @param exceptSid - A session id to keep, such as the caller's own.
 * @returns The number of deleted sessions.
 */
export const deleteUserSessions = async (
  pool: Queryable,
  userId: string,
  exceptSid?: string,
): Promise<number> => {
  const result = await pool.query(
    `DELETE FROM session
     WHERE sess -> 'user' ->> 'id' = $1
       AND ($2::varchar IS NULL OR sid <> $2)`,
    [String(userId), exceptSid ?? null],
  );
  return result.rowCount ?? 0;
};
