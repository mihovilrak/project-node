import { Pool } from 'pg';
import { File, FileWithUser } from '../types/file';

// Get all files for a task
export const getTaskFiles = async (
  pool: Pool,
  taskId: string
): Promise<FileWithUser[]> => {
  const result = await pool.query(
    `SELECT * FROM get_task_files($1)`,
    [taskId]
  );
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
  filePath: string
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
    [taskId, userId, originalName, storedName, size, mimeType, filePath]
  );
  return result.rows[0];
};

// Get a file by ID
export const getFileById = async (
  pool: Pool,
  fileId: string
): Promise<File | null> => {
  const result = await pool.query(
    `SELECT * FROM files 
    WHERE id = $1`,
    [fileId]
  );
  return result.rows[0] || null;
};

// Delete a file
export const deleteFile = async (
  pool: Pool,
  fileId: string
): Promise<void> => {
  await pool.query(
    `DELETE FROM files 
    WHERE id = $1`,
    [fileId]
  );
};
