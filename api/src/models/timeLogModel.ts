import { Pool } from 'pg';
import {
  TimeLog,
  TimeLogCreateInput,
  TimeLogUpdateInput,
  TimeLogQueryFilters,
  SpentTime,
} from '../types/timeLog';
import { buildUpdateAssignments } from '../utils/sqlUpdate';
import { Pagination, defaultPagination } from '../utils/pagination';

export const ALLOWED_TIME_LOG_UPDATE_KEYS = [
  'log_date',
  'spent_time',
  'description',
  'activity_type_id',
  'user_id',
] as const;

// Query strings arrive as '' when a filter input is cleared; that is "no
// filter", not an empty date.
const orNull = <T>(value: T | undefined | null): T | null =>
  value === undefined || value === null || (value as unknown) === ''
    ? null
    : value;

const queryTimeLogs = async (
  pool: Pool,
  scope: { taskId?: string; userId?: string; projectId?: string },
  params: TimeLogQueryFilters | undefined,
  pagination: Pagination,
): Promise<TimeLog[]> => {
  const result = await pool.query(
    'SELECT * FROM get_time_logs($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      scope.taskId ?? null,
      scope.userId ?? null,
      scope.projectId ?? null,
      orNull(params?.startDate),
      orNull(params?.endDate),
      orNull(params?.activity_type_id),
      pagination.limit,
      pagination.offset,
    ],
  );
  return result.rows;
};

export const getAllTimeLogs = async (
  pool: Pool,
  pagination: Pagination = defaultPagination(),
): Promise<TimeLog[]> => queryTimeLogs(pool, {}, undefined, pagination);

export const createTimeLog = async (
  pool: Pool,
  taskId: string,
  userId: string,
  timeLogData: TimeLogCreateInput,
): Promise<TimeLog> => {
  const { log_date, spent_time, description, activity_type_id } = timeLogData;
  const result = await pool.query(
    `INSERT INTO time_logs
    (task_id, user_id, log_date, spent_time, description, activity_type_id)
    VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE), $4, $5, $6)
    RETURNING *`,
    [
      taskId,
      userId,
      orNull(log_date),
      spent_time,
      description,
      activity_type_id,
    ],
  );
  return result.rows[0];
};

export const getTimeLogRef = async (
  pool: Pool,
  timeLogId: string,
): Promise<{ taskId: string; userId: string } | null> => {
  const result = await pool.query(
    'SELECT task_id, user_id FROM time_logs WHERE id = $1',
    [timeLogId],
  );
  const row = result.rows[0];
  return row
    ? { taskId: String(row.task_id), userId: String(row.user_id) }
    : null;
};

// Returns null when the time log does not exist.
export const updateTimeLog = async (
  pool: Pool,
  timeLogId: string,
  timeLogData: TimeLogUpdateInput,
): Promise<TimeLog | null> => {
  const assignments = buildUpdateAssignments(
    timeLogData as Record<string, unknown>,
    ALLOWED_TIME_LOG_UPDATE_KEYS,
  );
  if (!assignments) {
    const current = await pool.query('SELECT * FROM time_logs WHERE id = $1', [
      timeLogId,
    ]);
    return current.rows[0] || null;
  }

  const result = await pool.query(
    `UPDATE time_logs
    SET ${assignments.setClause}
    WHERE id = $${assignments.nextIndex}
    RETURNING *`,
    [...assignments.values, timeLogId],
  );
  return result.rows[0] || null;
};

export const deleteTimeLog = async (
  pool: Pool,
  timeLogId: string,
): Promise<boolean> => {
  const result = await pool.query('DELETE FROM time_logs WHERE id = $1', [
    timeLogId,
  ]);
  return (result.rowCount ?? 0) > 0;
};

export const getUserTimeLogs = async (
  pool: Pool,
  userId: string,
  params: TimeLogQueryFilters,
  pagination: Pagination = defaultPagination(),
): Promise<TimeLog[]> => queryTimeLogs(pool, { userId }, params, pagination);

export const getProjectTimeLogs = async (
  pool: Pool,
  projectId: string,
  params: TimeLogQueryFilters,
  pagination: Pagination = defaultPagination(),
): Promise<TimeLog[]> => queryTimeLogs(pool, { projectId }, params, pagination);

export const getProjectSpentTime = async (
  pool: Pool,
  projectId: string,
): Promise<SpentTime> => {
  const result = await pool.query(
    'SELECT get_spent_time(p_project_id => $1)::float8 AS spent_time',
    [projectId],
  );
  return result.rows[0];
};

export const getTaskTimeLogs = async (
  pool: Pool,
  taskId: string,
  params?: TimeLogQueryFilters,
  pagination: Pagination = defaultPagination(),
): Promise<TimeLog[]> => queryTimeLogs(pool, { taskId }, params, pagination);

export const getTaskSpentTime = async (
  pool: Pool,
  taskId: string,
): Promise<SpentTime> => {
  const result = await pool.query(
    'SELECT get_spent_time(p_task_id => $1)::float8 AS spent_time',
    [taskId],
  );
  return result.rows[0];
};
