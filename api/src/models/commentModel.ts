import { Pool } from 'pg';
import { Comment, CommentWithUser } from '../types/comment';
import { Queryable } from '../utils/transaction';

// Get all comments for a task
export const getTaskComments = async (
  pool: Pool,
  taskId: string,
): Promise<CommentWithUser[]> => {
  const result = await pool.query(
    'SELECT * FROM get_comments(p_task_id => $1)',
    [taskId],
  );
  return result.rows;
};

// Create a new comment for a task
export const createComment = async (
  db: Queryable,
  taskId: string,
  userId: string,
  comment: string,
): Promise<Comment> => {
  const result = await db.query(
    `INSERT INTO comments (task_id, user_id, comment)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [taskId, userId, comment],
  );
  return result.rows[0];
};

/**
 * Update an active comment on the given task and return it with user details.
 *
 * @param pool Database connection pool
 * @param id Comment ID to update
 * @param taskId Task the comment must belong to
 * @param comment New comment text
 * @returns The updated comment, or null if no active comment with that id
 *   exists on the task
 */
export const editComment = async (
  pool: Pool,
  id: string,
  taskId: string,
  comment: string,
): Promise<CommentWithUser | null> => {
  const updated = await pool.query(
    `UPDATE comments
    SET comment = $3
    WHERE id = $1 AND task_id = $2 AND active`,
    [id, taskId, comment],
  );

  if (!updated.rowCount) {
    return null;
  }

  const result = await pool.query('SELECT * FROM get_comments(p_id => $1)', [
    id,
  ]);

  return result.rows[0] || null;
};

/**
 * Soft-delete an active comment on the given task and return it, or null if not
 * found.
 *
 * @param pool Database connection pool
 * @param id Comment identifier
 * @param taskId Task the comment must belong to
 */
export const deleteComment = async (
  pool: Pool,
  id: string,
  taskId: string,
): Promise<Comment | null> => {
  const result = await pool.query(
    `UPDATE comments
    SET active = false
    WHERE id = $1 AND task_id = $2 AND active
    RETURNING *`,
    [id, taskId],
  );
  return result.rows[0] || null;
};
