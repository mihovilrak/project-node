import { Pool } from 'pg';
import {
  TimeLog,
  TimeLogCreateInput,
  TimeLogUpdateInput,
  TimeLogQueryFilters,
  SpentTime,
} from '../types/timeLog';
import { buildUpdateAssignments } from '../utils/sqlUpdate';
import {
  Pagination,
  defaultPagination,
  paginationClause,
} from '../utils/pagination';

export const ALLOWED_TIME_LOG_UPDATE_KEYS = [
  'log_date',
  'spent_time',
  'description',
  'activity_type_id',
] as const;

// get_time_logs only filters by task / user / project, so the rest of
// TimeLogQueryFilters is applied to its result set. Positional args are always
// $1-$3 so the filter placeholders keep the same numbers at every call site.
const FILTERED_TIME_LOGS = `SELECT * FROM get_time_logs($1, $2, $3)
  WHERE ($4::date IS NULL OR log_date >= $4::date)
  AND ($5::date IS NULL OR log_date <= $5::date)
  AND ($6::smallint IS NULL OR activity_type_id = $6::smallint)
  ORDER BY created_on DESC`;

// Query strings arrive as '' when a filter input is cleared; that is "no
// filter", not an empty date.
const orNull = <T>(value: T | undefined | null): T | null =>
  value === undefined || value === null || (value as unknown) === ''
    ? null
    : value;

const filterValues = (
  params?: TimeLogQueryFilters,
): (Date | number | null)[] => [
  orNull(params?.startDate),
  orNull(params?.endDate),
  orNull(params?.activity_type_id),
];

/**
 * Retrieve all time logs with optional pagination support.
 *
 * Returns time logs ordered by log date and id in descending order. Uses default pagination if not specified.
 * @param pool Database connection pool
 * @param pagination Pagination object controlling limit and offset; defaults to defaultPagination() if omitted
 */
export const getAllTimeLogs = async (
  pool: Pool,
  pagination: Pagination = defaultPagination(),
): Promise<TimeLog[]> => {
  const page = paginationClause(pagination, 1);
  const result = await pool.query(
    `SELECT * FROM get_time_logs(null, null, null)
     ORDER BY log_date DESC, id DESC
     ${page.clause}`,
    page.values,
  );
  return result.rows;
};

/**
 * Record time spent on a task by a user.
 *
 * Inserts a new time log entry into the database with the provided log date, spent time duration, description, and activity type. Returns the complete created time log record including its generated id and timestamps.
 * @param pool Database connection pool.
 * @param taskId Identifier of the task being logged.
 * @param userId Identifier of the user logging the time.
 * @param timeLogData Time log entry data including log date, spent time in hours or minutes, description, and activity type.
 * @returns The created time log record with all fields populated.
 */
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
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [taskId, userId, log_date, spent_time, description, activity_type_id],
  );
  return result.rows[0];
};

/**
 * Modify an existing time log entry with specified fields and return the updated record.
 *
 * Returns null if the time log is not found. Updates only allowed fields: log_date, spent_time, description, and activity_type_id. The updated_on timestamp is automatically set to the current time.
 * @param pool Database connection pool
 * @param timeLogId Unique identifier of the time log to update
 * @param timeLogData Object containing fields to update; only allowed fields are applied
 * @returns Updated TimeLog record or null if not found
 */
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
    SET ${assignments.setClause}, updated_on = CURRENT_TIMESTAMP
    WHERE id = $${assignments.nextIndex}
    RETURNING *`,
    [...assignments.values, timeLogId],
  );
  return result.rows[0] || null;
};

// Delete time log
export const deleteTimeLog = async (
  pool: Pool,
  timeLogId: string,
): Promise<void> => {
  await pool.query('DELETE FROM time_logs WHERE id = $1', [timeLogId]);
};

/**
 * Retrieve all time log entries for a specific user, optionally filtered by date range and activity type.
 *
 * Executes a database query to fetch time logs belonging to the specified user. Filter parameters allow narrowing results by start date, end date, and activity type ID. Returns all matching time log records in the order provided by the database.
 * @param pool Database connection pool for executing queries
 * @param userId The ID of the user whose time logs should be retrieved
 * @param params Query filters including optional startDate, endDate, and activity_type_id to narrow results
 * @returns Promise resolving to an array of TimeLog objects matching the specified user and filter criteria
 */
export const getUserTimeLogs = async (
  pool: Pool,
  userId: string,
  params: TimeLogQueryFilters,
): Promise<TimeLog[]> => {
  const result = await pool.query(FILTERED_TIME_LOGS, [
    null,
    userId,
    null,
    ...filterValues(params),
  ]);
  return result.rows;
};

// Get project time logs
export const getProjectTimeLogs = async (
  pool: Pool,
  projectId: string,
  params: TimeLogQueryFilters,
): Promise<TimeLog[]> => {
  const result = await pool.query(FILTERED_TIME_LOGS, [
    null,
    null,
    projectId,
    ...filterValues(params),
  ]);
  return result.rows;
};

/**
 * Retrieve the total time spent on all tasks within a project.
 * @param pool database connection pool
 * @param projectId identifier of the project
 * @returns SpentTime object containing the aggregated spent time in hours
 */
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

/**
 * Retrieve all time logs recorded against a specific task, optionally filtered by date range or activity type.
 *
 * Queries the database for time log entries associated with the given task ID. Supports filtering by start date, end date, and activity type ID. Returns an empty array if no matching time logs exist.
 * @param pool Database connection pool
 * @param taskId Identifier of the task to retrieve time logs for
 * @param params Optional filters to narrow results by date range or activity type
 * @returns Array of time log entries for the task
 */
export const getTaskTimeLogs = async (
  pool: Pool,
  taskId: string,
  params?: TimeLogQueryFilters,
): Promise<TimeLog[]> => {
  const result = await pool.query(FILTERED_TIME_LOGS, [
    taskId,
    null,
    null,
    ...filterValues(params),
  ]);
  return result.rows;
};

// Get task spent time
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
