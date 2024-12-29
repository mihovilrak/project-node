import { Pool, QueryResult } from "pg";
import { TaskWatcher } from "../types/task";

// Get task watchers
export const getTaskWatchers = async (
  pool: Pool,
  taskId: string
): Promise<TaskWatcher[]> => {
  const result: QueryResult<TaskWatcher> = await pool.query(
    `SELECT * FROM v_task_watchers 
    WHERE task_id = $1`,
    [taskId]
  );
  return result.rows;
}

// Add task watcher
export const addTaskWatcher = async (
  pool: Pool,
  taskId: string,
  userId: string
): Promise<TaskWatcher | null> => {
  const result: QueryResult<TaskWatcher> = await pool.query(
    `INSERT INTO watchers (task_id, user_id) 
    VALUES ($1, $2) 
    RETURNING *`,
    [taskId, userId]
  );
  return result.rows[0] || null;
}

// Remove task watcher
export const removeTaskWatcher = async (
  pool: Pool,
  taskId: string,
  userId: string
): Promise<number | null> => {
  const result: QueryResult = await pool.query(
    `DELETE FROM watchers 
    WHERE task_id = $1 
    AND user_id = $2`,
    [taskId, userId]
  );
  return result.rowCount;
}
