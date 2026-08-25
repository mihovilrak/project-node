import { Pool } from 'pg';
import { Role, RoleCreateInput, RoleUpdateInput } from '../types/role';
import logger from '../utils/logger';

// Get all roles
export const getRoles = async (pool: Pool): Promise<Role[]> => {
  const results = await pool.query(`
    SELECT * FROM get_roles()
  `);
  return results.rows;
};

export const createRole = async (
  pool: Pool, roleData: RoleCreateInput
): Promise<string> => {
  const { name, description, permissions } = roleData;
  try {
    const roleResult = await pool.query(
      'SELECT create_role($1, $2, $3, $4) as id',
      [name, description, true, permissions]
    );
    return roleResult.rows[0].id;
  } catch (error) {
    logger.error({ err: error }, 'Error creating role');
    throw error;
  }
};

export const updateRole = async (
  pool: Pool, id: string, roleData: RoleUpdateInput
): Promise<void> => {
  const { name, description, active, permissions } = roleData;
  try {
    await pool.query(
      'SELECT update_role($1, $2, $3, $4, $5)',
      [id, name, description, active, permissions]
    );
  } catch (error) {
    logger.error({ err: error }, 'Error updating role');
    throw error;
  }
};
