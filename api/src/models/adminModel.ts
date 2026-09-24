import { Pool } from 'pg';
import { SystemStats, SystemLog, Permission } from '../types/admin';

// Check if user is admin
export const isUserAdmin = async (
  pool: Pool,
  userId: string,
): Promise<boolean> => {
  const result = await pool.query(`SELECT is_admin($1)`, [userId]);
  return result.rows[0].is_admin;
};

/**
 * Retrieve aggregated system statistics including user counts, projects, tasks, and logged time.
 * @param pool Database connection pool used to execute the query.
 * @returns Promise resolving to an object containing total_users, total_projects, total_tasks, and total_time_logged.
 */
export const getSystemStats = async (pool: Pool): Promise<SystemStats> => {
  const result = await pool.query('SELECT * FROM get_system_stats()');
  return result.rows[0];
};

/**
 * Retrieve system activity logs with optional filtering by date range and activity type.
 *
 * Queries time_logs joined with user and activity type information, ordered by creation date descending. Date parameters default to negative infinity and current time respectively when omitted. Activity type filtering is applied only when the type parameter is provided.
 * @param pool Database connection pool
 * @param startDate ISO timestamp string for log start boundary, or undefined for earliest logs
 * @param endDate ISO timestamp string for log end boundary, or undefined for current time
 * @param type Activity type identifier to filter logs, or undefined to include all types
 */
export const getSystemLogs = async (
  pool: Pool,
  startDate?: string,
  endDate?: string,
  type?: string,
): Promise<SystemLog[]> => {
  let query = `
    SELECT tl.*,
    u.login as user_login,
    at.name as activity_name
    FROM time_logs tl
    JOIN users u ON tl.user_id = u.id
    JOIN activity_types at ON tl.activity_type_id = at.id
    WHERE tl.created_on >= COALESCE($1::timestamptz, '-infinity')
      AND tl.created_on <= COALESCE($2::timestamptz, now())
  `;

  // A bind parameter is never parsed as SQL, so 'NOW()' would reach Postgres as
  // a literal string; the default belongs in the statement instead.
  const params: (string | null)[] = [startDate ?? null, endDate ?? null];

  if (type) {
    query += ' AND tl.activity_type_id = $3';
    params.push(type);
  }

  query += ' ORDER BY tl.created_on DESC';

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Retrieve all system permissions ordered by name.
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
