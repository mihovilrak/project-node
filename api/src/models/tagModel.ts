import { Pool } from 'pg';
import { Tag, TagCreateInput, TagUpdateInput } from '../types/tag';

/**
 * Retrieve all active tags ordered by name.
 *
 * Returns tags where the active flag is true, sorted alphabetically by name.
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
 * Insert a new tag into the database with the provided name, color, and optional icon.
 *
 * If no icon is specified, defaults to 'Label'. Returns the newly created tag record with all fields including id, timestamps, and active status.
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
  const defaultIcon = icon || 'Label';
  const result = await pool.query(
    `INSERT INTO tags (name, color, icon)
    VALUES ($1, $2, $3)
    RETURNING *`,
    [name, color, defaultIcon],
  );
  return result.rows[0];
};

// Add tags to task
export const addTaskTags = async (
  pool: Pool,
  taskId: string,
  tagIds: string[],
): Promise<void> => {
  await pool.query(`SELECT add_task_tags($1, $2)`, [taskId, tagIds]);
};

// Remove tag from task
export const removeTaskTag = async (
  pool: Pool,
  taskId: string,
  tagId: string,
): Promise<void> => {
  await pool.query(
    `DELETE FROM task_tags
    WHERE task_id = $1 AND tag_id = $2`,
    [taskId, tagId],
  );
};

/**
 * Retrieve all active tags associated with a specific task, ordered by name.
 *
 * Returns only tags marked as active. Results are sorted alphabetically by tag name.
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
 * Update the name, color, or icon of an existing tag.
 *
 * If no fields are specified for update, the existing tag is returned unchanged. The updated_on timestamp is automatically set to the current time when any field is modified.
 * @param pool Database connection pool
 * @param id Identifier of the tag to update
 * @param name New tag name, or undefined to leave unchanged
 * @param color New tag color, or undefined to leave unchanged
 * @param icon New tag icon, or undefined to leave unchanged
 * @returns The updated tag object, or null if no tag with the given id exists
 */
export const updateTag = async (
  pool: Pool,
  id: string,
  name?: string,
  color?: string,
  icon?: string,
): Promise<Tag | null> => {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex}`);
    values.push(name);
    paramIndex++;
  }

  if (color !== undefined) {
    updates.push(`color = $${paramIndex}`);
    values.push(color);
    paramIndex++;
  }

  if (icon !== undefined) {
    updates.push(`icon = $${paramIndex}`);
    values.push(icon);
    paramIndex++;
  }

  if (updates.length === 0) {
    // No updates to make
    const result = await pool.query(`SELECT * FROM tags WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  updates.push(`updated_on = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query(
    `UPDATE tags
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *`,
    values,
  );
  return result.rows[0] || null;
};

/**
 * Mark a tag as inactive and return the updated record or null if not found.
 *
 * Performs a soft delete by setting the active flag to false and updating the timestamp, rather than removing the record from the database.
 * @param pool Database connection pool
 * @param id The tag identifier to delete
 * @returns The deleted tag object with updated fields, or null if the tag does not exist
 */
export const deleteTag = async (
  pool: Pool,
  id: string,
): Promise<Tag | null> => {
  const result = await pool.query(
    `UPDATE tags
    SET (active, updated_on) = (false, CURRENT_TIMESTAMP)
    WHERE id = $1
    RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
};
