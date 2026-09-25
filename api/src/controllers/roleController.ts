import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as roleModel from '../models/roleModel';
import { RoleCreateInput, RoleUpdateInput } from '../types/role';
import { parsePositiveInteger } from '../utils/requestParsing';

const pgCode = (error: unknown): string | undefined =>
  error instanceof Error && 'code' in error
    ? String((error as { code: unknown }).code)
    : undefined;

// Raised by update_role/delete_role when the seeded Admin role would be broken.
const ADMIN_ROLE_PROTECTED = '42501';

// Get all roles
export const getRoles = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const roles = await roleModel.getRoles(pool);
  res.status(200).json(roles);
};

/**
 * Create a role and return its id. A duplicate name yields 409 via the error
 * handler.
 *
 * @param req Express request with the role data in the body
 * @param res Express response
 * @param pool Database connection pool
 */
export const createRole = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const roleData = req.body as RoleCreateInput;
  if (typeof roleData?.name !== 'string' || !roleData.name.trim()) {
    res.status(400).json({ error: 'Role name is required' });
    return;
  }

  const roleId = await roleModel.createRole(pool, roleData);
  res.status(201).json({ message: 'Role created successfully', id: roleId });
};

/**
 * Update a role. The Admin role cannot be renamed, deactivated or lose the
 * Admin permission (403).
 *
 * @param req Express request with the role id in params and the role data in
 *   the body
 * @param res Express response
 * @param pool Database connection pool
 */
export const updateRole = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const id = parsePositiveInteger(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'Invalid role ID' });
    return;
  }
  const roleData = req.body as RoleUpdateInput;
  if (typeof roleData?.name !== 'string' || !roleData.name.trim()) {
    res.status(400).json({ error: 'Role name is required' });
    return;
  }

  try {
    await roleModel.updateRole(pool, String(id), roleData);
  } catch (error) {
    if (pgCode(error) === ADMIN_ROLE_PROTECTED) {
      res.status(403).json({ error: (error as Error).message });
      return;
    }
    throw error;
  }
  res
    .status(200)
    .json({ message: 'Role updated successfully', id: String(id) });
};

/**
 * Delete a role. Fails with 409 while users hold it and with 403 for the Admin
 * role.
 *
 * @param req Express request with the role id in params
 * @param res Express response
 * @param pool Database connection pool
 */
export const deleteRole = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const id = parsePositiveInteger(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'Invalid role ID' });
    return;
  }

  let deleted: boolean;
  try {
    deleted = await roleModel.deleteRole(pool, String(id));
  } catch (error) {
    const code = pgCode(error);
    if (code === ADMIN_ROLE_PROTECTED) {
      res.status(403).json({ error: (error as Error).message });
      return;
    }
    if (code === '23503') {
      res
        .status(409)
        .json({ error: 'Role cannot be deleted while assigned to users' });
      return;
    }
    throw error;
  }

  if (!deleted) {
    res.status(404).json({ error: 'Role not found' });
    return;
  }
  res.status(200).json({ message: 'Role deleted successfully' });
};
