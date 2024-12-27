import { Pool } from 'pg';
import { SystemStats, SystemLog, Permission } from '../types/admin';

// Check if user is admin
export const isUserAdmin = async (
  pool: Pool,
  userId: string
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT is_admin($1)`,
    [userId]
  );
  return result.rows[0].is_admin;
};

// Get system statistics
export const getSystemStats = async (pool: Pool): Promise<SystemStats> => {
  const result = await pool.query(`SELECT * FROM v_system_stats`);
  return result.rows[0];
};

// Get system logs
export const getSystemLogs = async (
  pool: Pool,
  startDate?: string,
  endDate?: string,
  type?: string
): Promise<SystemLog[]> => {
  let query = `
    SELECT tl.*, 
    u.login as user_login, 
    at.name as activity_name
    FROM time_logs tl
    JOIN users u ON tl.user_id = u.id
    JOIN activity_types at ON tl.activity_type_id = at.id
    WHERE tl.created_on BETWEEN $1 AND $2
  `;
  
  const params: (string | Date)[] = [startDate || '1970-01-01', endDate || 'NOW()'];
  
  if (type) {
    query += ' AND tl.activity_type_id = $3';
    params.push(type);
  }
  
  query += ' ORDER BY tl.created_on DESC';
  
  const result = await pool.query(query, params);
  return result.rows;
};

// Get all permissions
export const getAllPermissions = async (pool: Pool): Promise<Permission[]> => {
  const result = await pool.query(
    `SELECT id,
     name 
     FROM permissions
     ORDER BY name ASC`
  );
  return result.rows;
};
