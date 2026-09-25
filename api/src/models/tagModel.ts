import { Pool } from 'pg';
import { Tag, TagUpdateInput } from '../types/tag';
import { buildUpdateAssignments } from '../utils/sqlUpdate';

export const ALLOWED_TAG_UPDATE_KEYS = ['name', 'color', 'icon'] as const;

/**
 * Retrieve all active tags ordered by name.
 *
 * @param pool Database connection pool for executing the query.
 * @returns Promise resolving to an array of active Tag objects.
 */
export const getTags = async (pool: Pool): Promise<Tag[]> => {
  const result = await pool.query(
    `SELECT * FROM tags
    WHERE active = true
    ORDER BY name ASC`,
  );
  return result.rows;
};

/**
 * Insert a new tag; the icon defaults to 'Label'.
 *
 * @param pool Database connection pool
 * @param name Tag name
 * @param color Tag color value
 * @param icon Tag icon identifier
 * @returns The created tag object
 */
export const createTag = async (
  pool: Pool,
  name: string,
  color: string,
  icon?: string,
): Promise<Tag> => {
  const result = await pool.query(
    `INSERT INTO tags (name, color, icon)
    VALUES ($1, $2, $3)
    RETURNING *`,
    [name, color, icon || 'Label'],
  );
  return result.rows[0];
};

// Attach active tags to a task; unknown or inactive ids are ignored
export const addTaskTags = async (
  pool: Pool,
  taskId: string,
  tagIds: number[],
): Promise<void> => {
  await pool.query(`SELECT add_task_tags($1, $2)`, [taskId, tagIds]);
};

// Remove a tag from a task; returns false when the tag was not on the task
export const removeTaskTag = async (
  pool: Pool,
  taskId: string,
  tagId: string,
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM task_tags
    WHERE task_id = $1 AND tag_id = $2`,
    [taskId, tagId],
  );
  return (result.rowCount ?? 0) > 0;
};

/**
 * Retrieve the active tags of a task, ordered by name.
 *
 * @param pool Database connection pool
 * @param taskId Identifier of the task whose tags are to be retrieved
 */
export const getTaskTags = async (
  pool: Pool,
  taskId: string,
): Promise<Tag[]> => {
  const result = await pool.query(
    `SELECT t.*
    FROM tags t
    JOIN task_tags tt ON t.id = tt.tag_id
    WHERE tt.task_id = $1 AND t.active = true
    ORDER BY t.name ASC`,
    [taskId],
  );
  return result.rows;
};

/**
 * Update only the provided name, color or icon of a tag.
 *
 * @param pool Database connection pool
 * @param id Identifier of the tag to update
 * @param updates Validated fields to change
 * @returns The updated tag, or null if no tag with the given id exists
 */
export const updateTag = async (
  pool: Pool,
  id: string,
  updates: TagUpdateInput,
): Promise<Tag | null> => {
  const assignments = buildUpdateAssignments(
    updates as Record<string, unknown>,
    ALLOWED_TAG_UPDATE_KEYS,
  );
  if (!assignments) {
    const result = await pool.query(`SELECT * FROM tags WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  const result = await pool.query(
    `UPDATE tags
    SET ${assignments.setClause}
    WHERE id = $${assignments.nextIndex}
    RETURNING *`,
    [...assignments.values, id],
  );
  return result.rows[0] || null;
};

/**
 * Soft-delete an active tag.
 *
 * @param pool Database connection pool
 * @param id The tag identifier to delete
 * @returns The deactivated tag, or null if it does not exist or is already
 *   inactive
 */
export const deleteTag = async (
  pool: Pool,
  id: string,
): Promise<Tag | null> => {
  const result = await pool.query(
    `UPDATE tags
    SET active = false
    WHERE id = $1 AND active = true
    RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
};
