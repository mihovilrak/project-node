import { Pool } from 'pg';
import { Role, RoleCreateInput, RoleUpdateInput } from '../types/role';
import logger from '../utils/logger';
import { invalidatePermissionCache } from './permissionModel';

// Get all roles
export const getRoles = async (pool: Pool): Promise<Role[]> => {
  const results = await pool.query(`
    SELECT * FROM get_roles()
  `);
  return results.rows;
};

/**
 * Insert a new role with the specified name, description, and permissions into the database.
 * @param pool Database connection pool for executing the query.
 * @param roleData Object containing the role name, optional description, and optional permissions array.
 * @returns The unique identifier of the newly created role.
 */
export const createRole = async (
  pool: Pool,
  roleData: RoleCreateInput,
): Promise<string> => {
  const { name, description, permissions } = roleData;
  try {
    const roleResult = await pool.query(
      'SELECT create_role($1, $2, $3, $4) as id',
      [name, description, true, permissions],
    );
    return roleResult.rows[0].id;
  } catch (error) {
    logger.error({ err: error }, 'Error creating role');
    throw error;
  }
};

/**
 * Modify an existing role with updated attributes and permissions.
 * @param pool Connection pool for database access
 * @param id Identifier of the role to update
 * @param roleData Object containing optional fields to update: name, description, active status, and permissions array
 */
export const updateRole = async (
  pool: Pool,
  id: string,
  roleData: RoleUpdateInput,
): Promise<void> => {
  const { name, description, active, permissions } = roleData;
  try {
    await pool.query('SELECT update_role($1, $2, $3, $4, $5)', [
      id,
      name,
      description,
      active,
      permissions,
    ]);
    invalidatePermissionCache(pool);
  } catch (error) {
    logger.error({ err: error }, 'Error updating role');
    throw error;
  }
};

/**
 * Remove a role from the database and invalidate the permission cache if successful.
 * @param pool Database connection pool to execute the query.
 * @param id Identifier of the role to delete.
 * @returns True if the role was successfully deleted, false otherwise.
 */
export const deleteRole = async (pool: Pool, id: string): Promise<boolean> => {
  const result = await pool.query('SELECT delete_role($1) AS deleted', [id]);
  const deleted = result.rows[0]?.deleted === true;
  if (deleted) invalidatePermissionCache(pool);
  return deleted;
};
