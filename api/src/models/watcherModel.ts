import { Pool, QueryResult } from 'pg';
import { NewTaskWatcher, TaskWatcher } from '../types/task';

// Get task watchers
export const getTaskWatchers = async (
  pool: Pool,
  taskId: string,
): Promise<TaskWatcher[]> => {
  const result: QueryResult<TaskWatcher> = await pool.query(
    'SELECT * FROM get_task_watchers($1)',
    [taskId],
  );
  return result.rows;
};

/**
 * Insert a task watcher. A duplicate raises a unique violation (23505).
 *
 * @param pool Database connection pool
 * @param taskId The task identifier to watch
 * @param userId The user identifier to add as watcher
 * @returns The watcher row plus the get_task_watchers() list fields
 */
export const addTaskWatcher = async (
  pool: Pool,
  taskId: string,
  userId: number,
): Promise<NewTaskWatcher> => {
  const result: QueryResult<NewTaskWatcher> = await pool.query(
    `WITH w AS (
      INSERT INTO watchers (task_id, user_id)
      VALUES ($1, $2)
      RETURNING *
    )
    SELECT w.id, w.task_id, w.user_id, w.created_on,
      u.name || ' ' || u.surname AS user_name,
      r.name AS role
    FROM w
    LEFT JOIN users u ON u.id = w.user_id
    LEFT JOIN roles r ON r.id = u.role_id`,
    [taskId, userId],
  );
  return result.rows[0];
};

/**
 * Delete a user's watcher entry for a task.
 *
 * Returns the number of rows deleted, or null if the operation failed.
 *
 * @param pool Database connection pool
 * @param taskId Identifier of the task to stop watching
 * @param userId Identifier of the user removing their watch
 * @returns Number of deleted watcher records, or null on failure
 */
export const removeTaskWatcher = async (
  pool: Pool,
  taskId: string,
  userId: number,
): Promise<number | null> => {
  const result: QueryResult = await pool.query(
    `DELETE FROM watchers
    WHERE task_id = $1
    AND user_id = $2`,
    [taskId, userId],
  );
  return result.rowCount;
};
