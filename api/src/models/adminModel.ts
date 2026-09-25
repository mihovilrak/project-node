import { Pool } from 'pg';
import {
  SystemStats,
  TimeLogReportRow,
  TimeLogReportFilters,
  Permission,
} from '../types/admin';
import {
  Pagination,
  defaultPagination,
  paginationClause,
} from '../utils/pagination';

/**
 * Retrieve aggregated system statistics including user counts, projects, tasks,
 * and logged time.
 *
 * @param pool Database connection pool used to execute the query.
 * @returns Promise resolving to an object containing total_users,
 *   total_projects, total_tasks, and total_time_logged.
 */
export const getSystemStats = async (pool: Pool): Promise<SystemStats> => {
  const result = await pool.query('SELECT * FROM get_system_stats()');
  return result.rows[0];
};

/**
 * Retrieve a page of time logs across all users for the admin report, newest
 * first.
 *
 * The start date defaults to the earliest log and the end date to now. The
 * activity type filter applies only when set.
 *
 * @param pool Database connection pool
 * @param filters Optional date range and activity type filters
 * @param pagination Page size and offset
 */
export const getTimeLogReport = async (
  pool: Pool,
  filters: TimeLogReportFilters = {},
  pagination: Pagination = defaultPagination(),
): Promise<TimeLogReportRow[]> => {
  // A bind parameter is never parsed as SQL, so 'NOW()' would reach Postgres as
  // a literal string; the default belongs in the statement instead.
  const params: (string | number | null)[] = [
    filters.startDate ?? null,
    filters.endDate ?? null,
    filters.type ?? null,
  ];
  const page = paginationClause(pagination, params.length + 1);
  const result = await pool.query(
    `SELECT tl.*,
       u.login AS user_login,
       at.name AS activity_name
     FROM time_logs tl
     JOIN users u ON tl.user_id = u.id
     JOIN activity_types at ON tl.activity_type_id = at.id
     WHERE tl.created_on >= COALESCE($1::timestamptz, '-infinity')
       AND tl.created_on <= COALESCE($2::timestamptz, now())
       AND ($3::integer IS NULL OR tl.activity_type_id = $3::integer)
     ORDER BY tl.created_on DESC, tl.id DESC
     ${page.clause}`,
    [...params, ...page.values],
  );
  return result.rows;
};

/**
 * Retrieve all system permissions ordered by name.
 *
 * @param pool Database connection pool
 */
export const getAllPermissions = async (pool: Pool): Promise<Permission[]> => {
  const result = await pool.query(
    `SELECT id,
     name
     FROM permissions
     ORDER BY name ASC`,
  );
  return result.rows;
};
