import { Pool } from 'pg';
import { TaskType } from '../types/taskType';
import { LOOKUP_TYPE_KEYS, LookupTypeValues } from '../utils/lookupType';
import { buildUpdateAssignments } from '../utils/sqlUpdate';

/**
 * Retrieve all active task types ordered by name.
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
 * Insert a new task type and return the created record.
 * @param pool Database connection pool.
 * @param input Validated task type fields; name, color and icon are required.
 */
export const createTaskType = async (
  pool: Pool,
  input: {
    name: string;
    description: string | null;
    color: string;
    icon: string;
    active: boolean;
  },
): Promise<TaskType> => {
  const result = await pool.query(
    `INSERT INTO task_types
    (name, description, color, icon, active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [input.name, input.description, input.color, input.icon, input.active],
  );
  return result.rows[0];
};

/**
 * Update only the provided fields of a task type.
 * @param pool Database connection pool
 * @param id Task type identifier
 * @param updates Validated fields to change; omitted keys are left untouched
 * @returns Updated TaskType or null if task type not found
 */
export const updateTaskType = async (
  pool: Pool,
  id: string,
  updates: LookupTypeValues,
): Promise<TaskType | null> => {
  const assignments = buildUpdateAssignments(updates, LOOKUP_TYPE_KEYS);
  if (!assignments) return getTaskTypeById(pool, id);

  const result = await pool.query(
    `UPDATE task_types
    SET ${assignments.setClause}
    WHERE id = $${assignments.nextIndex}
    RETURNING *`,
    [...assignments.values, id],
  );
  return result.rows[0] || null;
};

/**
 * Soft-delete an active task type.
 * @param pool Database connection pool
 * @param id Task type identifier
 * @returns The deactivated task type, or null if it does not exist or is already inactive
 */
export const deleteTaskType = async (
  pool: Pool,
  id: string,
): Promise<TaskType | null> => {
  const result = await pool.query(
    `UPDATE task_types
    SET active = false
    WHERE id = $1 AND active = true
    RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
};
