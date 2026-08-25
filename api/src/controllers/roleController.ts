import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as roleModel from '../models/roleModel';
import { RoleCreateInput, RoleUpdateInput } from '../types/role';
import logger from '../utils/logger';

// Get all roles
export const getRoles = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const roles = await roleModel.getRoles(pool);
    res.status(200).json(roles);
  } catch (error) {
    logger.error({ err: error }, 'Error getting roles');
    res.status(500).json({ error: 'Failed to get roles' });
  }
};

export const createRole = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const roleData = req.body as RoleCreateInput;

    if (!roleData.name) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const roleId = await roleModel.createRole(pool, roleData);
    res.status(201).json({
      message: 'Role created successfully',
      id: roleId
    });
  } catch (error) {
    logger.error({ err: error }, 'Error creating role');
    if (error instanceof Error && 'code' in error && error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: 'Role with this name already exists'
      });
    }
    res.status(500).json({
      error: 'Failed to create role'
    });
  }
};

export const updateRole = async (
  req: Request,
  res: Response,
  pool: Pool
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
      id
    });
  } catch (error) {
    logger.error({ err: error }, 'Error updating role');
    if (error instanceof Error && 'code' in error) {
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'Role with this name already exists'
        });
      }
      if (error.code === '404') {
        return res.status(404).json({ error: 'Role not found' });
      }
    }
    res.status(500).json({ error: 'Failed to update role' });
  }
};
