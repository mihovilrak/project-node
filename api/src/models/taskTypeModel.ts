import { Pool } from 'pg';
import { TaskType } from '../types/taskType';

/**
 * Retrieve all active task types ordered by name.
 *
 * Only returns task types with active status true, sorted alphabetically by name.
 * @param pool Database connection pool for executing the query
 * @returns Promise resolving to an array of active TaskType objects
 */
export const getTaskTypes = async (pool: Pool): Promise<TaskType[]> => {
  const result = await pool.query(
    `SELECT * FROM task_types
    WHERE active = true
    ORDER BY name ASC`,
  );
  return result.rows;
};

// Get a task type by ID
export const getTaskTypeById = async (
  pool: Pool,
  id: string,
): Promise<TaskType | null> => {
  const result = await pool.query(
    `SELECT * FROM task_types
    WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

/**
 * Insert a new task type into the database.
 *
 * The function persists a task type record with the provided attributes and returns the complete created record including its assigned identifier and timestamps.
 * @param pool Database connection pool.
 * @param name The task type name.
 * @param description Optional descriptive text for the task type.
 * @param color A color value for visual representation.
 * @param icon Optional icon identifier for the task type.
 * @param active Whether the task type is active.
 * @returns The created TaskType record with all fields populated.
 */
export const createTaskType = async (
  pool: Pool,
  name: string,
  description: string | null,
  color: string,
  icon: string | null,
  active: boolean,
): Promise<TaskType> => {
  const result = await pool.query(
    `INSERT INTO task_types
    (name, description, color, icon, active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [name, description, color, icon, active],
  );
  return result.rows[0];
};

/**
 * Modify a task type by ID with selectively updatable fields.
 *
 * Passes null for any field to leave it unchanged. Returns the updated task type or null if no matching task type exists. The updated_on timestamp is automatically set to the current time.
 * @param pool Database connection pool
 * @param id Task type identifier
 * @param name New task type name, or null to keep existing
 * @param description New task type description, or null to keep existing
 * @param color New task type color, or null to keep existing
 * @param icon New task type icon, or null to keep existing
 * @param active New active status, or null to keep existing
 * @returns Updated TaskType or null if task type not found
 */
export const updateTaskType = async (
  pool: Pool,
  id: string,
  name: string | null,
  description: string | null,
  color: string | null,
  icon: string | null,
  active: boolean | null,
): Promise<TaskType | null> => {
  const result = await pool.query(
    `UPDATE task_types
    SET (name, description, color, icon, active, updated_on) = ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    WHERE id = $6
    RETURNING *`,
    [name, description, color, icon, active, id],
  );
  return result.rows[0] || null;
};

/**
 * Deactivate a task type by marking it inactive instead of removing it from the database.
 *
 * The function performs a soft delete by setting the active flag to false and updating the timestamp, then returns the modified task type record or null if not found.
 * @param pool Database connection pool
 * @param id Task type identifier
 */
export const deleteTaskType = async (
  pool: Pool,
  id: string,
): Promise<TaskType | null> => {
  const result = await pool.query(
    `UPDATE task_types
    SET (active, updated_on) = (false, CURRENT_TIMESTAMP)
    WHERE id = $1
    RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
};
