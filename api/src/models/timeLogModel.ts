import { Pool } from 'pg';
import { TimeLog, TimeLogCreateInput, TimeLogUpdateInput, TimeLogQueryFilters, SpentTime } from '../types/timeLog';

// Time log model
export const getAllTimeLogs = async (pool: Pool): Promise<TimeLog[]> => {
  const result = await pool.query(
    `SELECT * FROM v_time_logs 
    ORDER BY created_on DESC`
  );
  return result.rows;
};

// Create time log
export const createTimeLog = async (
  pool: Pool,
  taskId: string,
  userId: string,
  timeLogData: TimeLogCreateInput
): Promise<TimeLog> => {
  const { log_date, spent_time, description, activity_type_id } = timeLogData;
  const result = await pool.query(
    `INSERT INTO time_logs 
    (task_id, user_id, log_date, spent_time, description, activity_type_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [taskId, userId, log_date, spent_time, description, activity_type_id]
  );
  return result.rows[0];
};

// Update time log
export const updateTimeLog = async (
  pool: Pool,
  timeLogId: string,
  timeLogData: TimeLogUpdateInput
): Promise<TimeLog> => {
  const { log_date, spent_time, description, activity_type_id } = timeLogData;
  const result = await pool.query(
    `UPDATE time_logs 
    SET (log_date, spent_time, description, activity_type_id) = ($1, $2, $3, $4)
    WHERE id = $5
    RETURNING *`,
    [log_date, spent_time, description, activity_type_id, timeLogId]
  );
  return result.rows[0];
};

// Delete time log
export const deleteTimeLog = async (pool: Pool, timeLogId: string): Promise<void> => {
  await pool.query(
    'DELETE FROM time_logs WHERE id = $1',
    [timeLogId]
  );
};

// Get user time logs
export const getUserTimeLogs = async (
  pool: Pool,
  userId: string,
  params: TimeLogQueryFilters
): Promise<TimeLog[]> => {
  const result = await pool.query(
    `SELECT * FROM v_time_logs 
    WHERE user_id = $1 
    ORDER BY created_on DESC`,
    [userId]
  );
  return result.rows;
}; 

// Get project time logs
export const getProjectTimeLogs = async (
  pool: Pool,
  projectId: string,
  params: TimeLogQueryFilters
): Promise<TimeLog[]> => {
  const result = await pool.query(
    `SELECT * FROM v_time_logs 
    WHERE project_id = $1 
    ORDER BY created_on DESC`,
    [projectId]
  );
  return result.rows;
};

// Get project spent time
export const getProjectSpentTime = async (pool: Pool, projectId: string): Promise<SpentTime> => {
  const result = await pool.query(
    `SELECT * FROM v_project_spent_time 
    WHERE project_id = $1`,
    [projectId]
  );
  return result.rows[0];
};

// Get task time logs
export const getTaskTimeLogs = async (pool: Pool, taskId: string): Promise<TimeLog[]> => {
  const result = await pool.query(
    `SELECT * FROM v_time_logs 
    WHERE task_id = $1`,
    [taskId]
  );
  return result.rows;
};

// Get task spent time
export const getTaskSpentTime = async (pool: Pool, taskId: string): Promise<SpentTime> => {
  const result = await pool.query(
    `SELECT * FROM v_task_spent_time 
    WHERE task_id = $1`,
    [taskId]
  );
  return result.rows[0];
};
