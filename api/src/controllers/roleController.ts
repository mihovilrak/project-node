import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as roleModel from '../models/roleModel';
import { RoleCreateInput, RoleUpdateInput } from '../types/role';
import logger from '../utils/logger';

// Get all roles
export const getRoles = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const roles = await roleModel.getRoles(pool);
    res.status(200).json(roles);
  } catch (error) {
    logger.error({ err: error }, 'Error getting roles');
    res.status(500).json({ error: 'Failed to get roles' });
  }
};

/**
 * Insert a new role record from request data into the database and return the created role ID.
 * @param req Express request object containing role data in the body with required name field.
 * @param res Express response object used to send status and JSON responses.
 * @param pool Database connection pool for executing queries.
 */
export const createRole = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const roleData = req.body as RoleCreateInput;

    if (!roleData.name) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const roleId = await roleModel.createRole(pool, roleData);
    res.status(201).json({
      message: 'Role created successfully',
      id: roleId,
    });
  } catch (error) {
    logger.error({ err: error }, 'Error creating role');
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      // Unique violation
      return res.status(409).json({
        error: 'Role with this name already exists',
      });
    }
    res.status(500).json({
      error: 'Failed to create role',
    });
  }
};

/**
 * Modify an existing role with validation of required fields and conflict detection.
 * @param req Express request containing the role ID in params and updated role data in the body
 * @param res Express response object for sending the result or error
 * @param pool Database connection pool for executing the update operation
 */
export const updateRole = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const roleData = req.body as RoleUpdateInput;

    if (!id) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    if (!roleData.name) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    await roleModel.updateRole(pool, id, roleData);
    res.status(200).json({
      message: 'Role updated successfully',
      id,
    });
  } catch (error) {
    logger.error({ err: error }, 'Error updating role');
    if (error instanceof Error && 'code' in error) {
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'Role with this name already exists',
        });
      }
      if (error.code === '404') {
        return res.status(404).json({ error: 'Role not found' });
      }
    }
    res.status(500).json({ error: 'Failed to update role' });
  }
};

/**
 * Delete a role by identifier, preventing deletion if the role is assigned to users.
 * @param req Express request object containing the role identifier in params
 * @param res Express response object for sending JSON responses
 * @param pool Database connection pool for executing queries
 */
export const deleteRole = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const deleted = await roleModel.deleteRole(pool, id);

    if (!deleted) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting role');
    if (error instanceof Error && 'code' in error && error.code === '23503') {
      return res
        .status(409)
        .json({ error: 'Role cannot be deleted while assigned to users' });
    }
    res.status(500).json({ error: 'Failed to delete role' });
  }
};
