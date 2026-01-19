import { Pool } from 'pg';
import { Permission, UserPermission } from '../types/permission';

// Get all permissions for a user
export const getUserPermissions = async (
  pool: Pool,
  userId: string
): Promise<UserPermission[]> => {
  const result = await pool.query(
    'SELECT * FROM get_user_permissions($1)',
    [userId]
  );
  return result.rows;
};

// Check if a user has a specific permission
export const hasPermission = async (
  pool: Pool,
  userId: string,
  requiredPermission: Permission
): Promise<boolean> => {
  const result = await pool.query(
    'SELECT permission_check($1, $2)',
    [userId, requiredPermission]
  );

  return result.rows[0].permission_check;
};
