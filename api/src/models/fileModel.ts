import { Pool } from 'pg';
import { File, FileWithUser } from '../types/file';

// Get all files for a task
export const getTaskFiles = async (
  pool: Pool,
  taskId: string,
): Promise<FileWithUser[]> => {
  const result = await pool.query(`SELECT * FROM get_task_files($1)`, [taskId]);
  return result.rows;
};

// Create a new file for a task
export const createFile = async (
  pool: Pool,
  taskId: string,
  userId: string,
  originalName: string,
  storedName: string,
  size: number,
  mimeType: string,
  filePath: string,
): Promise<File> => {
  const result = await pool.query(
    `INSERT INTO files (
      task_id,
      user_id,
      original_name,
      stored_name,
      size,
      mime_type,
      file_path
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [taskId, userId, originalName, storedName, size, mimeType, filePath],
  );
  return result.rows[0];
};

// Get a file by ID
export const getFileById = async (
  pool: Pool,
  fileId: string,
): Promise<File | null> => {
  const result = await pool.query(
    `SELECT * FROM files
    WHERE id = $1`,
    [fileId],
  );
  return result.rows[0] || null;
};

/**
 * Remove a file record from the database, returning the deleted row only if the
 * ownership check passes.
 *
 * When ownerId is provided, deletion is restricted to files owned by that user.
 * Returns null if the file does not exist or if the ownership predicate does
 * not match, allowing callers to safely unlink blobs only when deletion was
 * confirmed.
 *
 * @param pool Database connection pool.
 * @param fileId The ID of the file to delete.
 * @param ownerId Optional user ID to restrict deletion to files owned by this
 *   user. If omitted, any file with the given ID is deleted.
 * @param taskId Optional task ID the file must belong to.
 * @returns The deleted file record, or null if the file was not found or
 *   ownership validation failed.
 */
export const deleteFile = async (
  pool: Pool,
  fileId: string,
  ownerId?: string,
  taskId?: string,
): Promise<File | null> => {
  const values = [fileId];
  const conditions = ['id = $1'];
  if (ownerId) {
    values.push(ownerId);
    conditions.push(`user_id = $${values.length}`);
  }
  if (taskId) {
    values.push(taskId);
    conditions.push(`task_id = $${values.length}`);
  }
  const result = await pool.query(
    `DELETE FROM files
    WHERE ${conditions.join(' AND ')}
    RETURNING *`,
    values,
  );
  return result.rows[0] || null;
};
