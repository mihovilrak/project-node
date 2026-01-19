import { Pool } from 'pg';
import { TaskType } from '../types/taskType';

// Get all task types
export const getTaskTypes = async (pool: Pool): Promise<TaskType[]> => {
  const result = await pool.query(
    `SELECT * FROM task_types
    WHERE active = true
    ORDER BY name ASC`
  );
  return result.rows;
};

// Get a task type by ID
export const getTaskTypeById = async (
  pool: Pool,
  id: string
): Promise<TaskType | null> => {
  const result = await pool.query(
    `SELECT * FROM task_types
    WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

// Create a task type
export const createTaskType = async (
  pool: Pool,
  name: string,
  description: string | null,
  color: string,
  icon: string | null,
  active: boolean
): Promise<TaskType> => {
  const result = await pool.query(
    `INSERT INTO task_types
    (name, description, color, icon, active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [name, description, color, icon, active]
  );
  return result.rows[0];
};

// Update a task type
export const updateTaskType = async (
  pool: Pool,
  id: string,
  name: string | null,
  description: string | null,
  color: string | null,
  icon: string | null,
  active: boolean | null
): Promise<TaskType | null> => {
  const result = await pool.query(
    `UPDATE task_types
    SET (name, description, color, icon, active, updated_on) = ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    WHERE id = $6
    RETURNING *`,
    [name, description, color, icon, active, id]
  );
  return result.rows[0] || null;
};

// Delete a task type
export const deleteTaskType = async (pool: Pool, id: string): Promise<TaskType | null> => {
  const result = await pool.query(
    `UPDATE task_types
    SET (active, updated_on) = (false, CURRENT_TIMESTAMP)
    WHERE id = $1
    RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};
