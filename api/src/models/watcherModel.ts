import { Pool, QueryResult } from 'pg';
import { TaskWatcher } from '../types/task';

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
 * Insert a new task watcher record and return the created watcher or null if insertion fails.
 *
 * Returns the inserted TaskWatcher row with task_id and user_id, or null if no row was returned from the database.
 * @param pool Database connection pool
 * @param taskId The task identifier to watch
 * @param userId The user identifier to add as watcher
 * @returns The newly created TaskWatcher object or null
 */
export const addTaskWatcher = async (
  pool: Pool,
  taskId: string,
  userId: number,
): Promise<TaskWatcher | null> => {
  const result: QueryResult<TaskWatcher> = await pool.query(
    `INSERT INTO watchers (task_id, user_id)
    VALUES ($1, $2)
    RETURNING *`,
    [taskId, userId],
  );
  return result.rows[0] || null;
};

/**
 * Delete a user's watcher entry for a task.
 *
 * Returns the number of rows deleted, or null if the operation failed.
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
