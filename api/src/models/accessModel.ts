import { Pool } from 'pg';
import { hasPermission } from './permissionModel';

const MEMBERSHIP_PREDICATE = `(pu.user_id IS NOT NULL OR p.created_by = $2)`;

export const isProjectMember = async (
  pool: Pool,
  projectId: string,
  userId: string,
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT 1
    FROM projects p
    LEFT JOIN project_users pu ON pu.project_id = p.id AND pu.user_id = $2
    WHERE p.id = $1 AND ${MEMBERSHIP_PREDICATE}
    LIMIT 1`,
    [projectId, userId],
  );
  return (result.rowCount ?? 0) > 0;
};

// Is the user a member of the project the task belongs to?
export const isTaskProjectMember = async (
  pool: Pool,
  taskId: string,
  userId: string,
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT 1
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    LEFT JOIN project_users pu ON pu.project_id = p.id AND pu.user_id = $2
    WHERE t.id = $1 AND ${MEMBERSHIP_PREDICATE}
    LIMIT 1`,
    [taskId, userId],
  );
  return (result.rowCount ?? 0) > 0;
};

/**
 * Generate a SQL subquery that returns project IDs the user can access, for embedding in list queries to avoid pagination issues from post-filtering.
 *
 * Embed this subquery directly in list queries rather than fetching IDs first and filtering in JavaScript, since post-filtering a paged result silently returns incomplete pages.
 * @param userIdIndex The parameter index for the user ID placeholder in the SQL query.
 */
export const accessibleProjectsSubquery = (userIdIndex: number): string =>
  `SELECT DISTINCT ap.id
    FROM projects ap
    LEFT JOIN project_users apu ON apu.project_id = ap.id AND apu.user_id = $${userIdIndex}
    WHERE apu.user_id IS NOT NULL OR ap.created_by = $${userIdIndex}`;

export const getAccessibleProjectIds = async (
  pool: Pool,
  userId: string,
): Promise<number[]> => {
  const result = await pool.query<{ id: number }>(
    accessibleProjectsSubquery(1),
    [userId],
  );
  return result.rows.map((row) => Number(row.id));
};

// The user id a list query must scope to, or null when the user is an
// administrator and sees everything.
export const resolveProjectScope = async (
  pool: Pool,
  userId: string,
): Promise<string | null> =>
  (await hasPermission(pool, userId, 'Admin')) ? null : userId;

/**
 * Remove rows for projects the user cannot access, unless the user holds Admin permission.
 *
 * Administrators receive the complete result set unchanged. Non-administrators are filtered to only rows where the project ID matches their accessible projects.
 * @param pool Database connection pool
 * @param userId User identifier to check access permissions for
 * @param rows Array of objects to filter
 * @param projectIdKey Object key containing the project identifier
 */
export const filterByProjectAccess = async <T extends object>(
  pool: Pool,
  userId: string,
  rows: T[],
  projectIdKey: keyof T,
): Promise<T[]> => {
  if (rows.length === 0) return rows;
  if (await hasPermission(pool, userId, 'Admin')) return rows;
  const accessible = new Set(await getAccessibleProjectIds(pool, userId));
  return rows.filter((row) => accessible.has(Number(row[projectIdKey])));
};

/**
 * Verify whether a user authored a given comment, enforcing that only the original author can edit or remove it.
 *
 * A comment may only be edited or removed by its author.
 * @param pool database connection pool
 * @param commentId identifier of the comment to check
 * @param userId identifier of the user to verify as the author
 */
export const isCommentAuthor = async (
  pool: Pool,
  commentId: string,
  userId: string,
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT 1 FROM comments WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [commentId, userId],
  );
  return (result.rowCount ?? 0) > 0;
};

/**
 * Verify that a user owns the specified time log and may edit or remove it.
 *
 * A time log may only be edited or removed by the user who logged it.
 * @param pool Database connection pool.
 * @param timeLogId Identifier of the time log to check.
 * @param userId Identifier of the user to verify ownership.
 * @returns A promise that resolves to true if the user owns the time log, false otherwise.
 */
export const isTimeLogOwner = async (
  pool: Pool,
  timeLogId: string,
  userId: string,
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT 1 FROM time_logs WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [timeLogId, userId],
  );
  return (result.rowCount ?? 0) > 0;
};
