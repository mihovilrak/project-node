import { Pool } from 'pg';
import { Tag, TagCreateInput, TagUpdateInput } from '../types/tag';

// Get all tags
export const getTags = async (pool: Pool): Promise<Tag[]> => {
  const result = await pool.query(
    `SELECT * FROM tags 
    WHERE active = true 
    ORDER BY name ASC` 
  );
  return result.rows;
};

// Create a tag
export const createTag = async (
  pool: Pool,
  name: string,
  color: string,
  userId: string
): Promise<Tag> => {
  const result = await pool.query(
    `INSERT INTO tags (name, color, created_by) 
    VALUES ($1, $2, $3) 
    RETURNING *`,
    [name, color, userId]
  );
  return result.rows[0];
};

// Add tags to task
export const addTaskTags = async (
  pool: Pool,
  taskId: string,
  tagIds: string[]
): Promise<void> => {
  await pool.query(
    `SELECT add_task_tags($1, $2)`,
    [taskId, tagIds]
  );
};

// Remove tag from task
export const removeTaskTag = async (
  pool: Pool,
  taskId: string,
  tagId: string
): Promise<void> => {
  await pool.query(
    `DELETE FROM task_tags 
    WHERE task_id = $1 AND tag_id = $2`,
    [taskId, tagId]
  );
};

// Get task tags
export const getTaskTags = async (
  pool: Pool,
  taskId: string
): Promise<Tag[]> => {
  const result = await pool.query(
    `SELECT t.* 
    FROM tags t
    JOIN task_tags tt ON t.id = tt.tag_id
    WHERE tt.task_id = $1 AND t.active = true
    ORDER BY t.name ASC`,
    [taskId]
  );
  return result.rows;
};

// Update tag
export const updateTag = async (
  pool: Pool,
  id: string,
  name: string,
  color: string
): Promise<Tag | null> => {
  const result = await pool.query(
    `UPDATE tags 
    SET (name, color, updated_on) = ($1, $2, CURRENT_TIMESTAMP)
    WHERE id = $3
    RETURNING *`,
    [name, color, id]
  );
  return result.rows[0] || null;
};

// Delete tag
export const deleteTag = async (pool: Pool, id: string): Promise<Tag | null> => {
  const result = await pool.query(
    `UPDATE tags 
    SET (active, updated_on) = (false, CURRENT_TIMESTAMP)
    WHERE id = $1 
    RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};
