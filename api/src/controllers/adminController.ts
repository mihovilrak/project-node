import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as adminModel from '../models/adminModel';
import { CustomRequest } from '../types/express';
import { SystemLogQuery } from '../types/admin';

// Check if user is admin
export const checkAdminAccess = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<boolean | Response> => {
  try {
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const isAdmin = await adminModel.isUserAdmin(pool, userId);
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Pass control to next middleware if user is admin
    return true;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
    return false;
  }
};

// Get system statistics
export const getSystemStats = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const stats = await adminModel.getSystemStats(pool);
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get system logs
export const getSystemLogs = async (
  req: Request<{}, {}, {}, SystemLogQuery>,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const { startDate, endDate, type } = req.query;
    const logs = await adminModel.getSystemLogs(pool, startDate, endDate, type);
    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all permissions
export const getAllPermissions = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const permissions = await adminModel.getAllPermissions(pool);
    res.status(200).json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};
