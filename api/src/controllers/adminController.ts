import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as adminModel from '../models/adminModel';
import { CustomRequest } from '../types/express';
import { SystemLogQuery } from '../types/admin';
import logger from '../utils/logger';

/**
 * Verify that the authenticated user has administrator privileges.
 *
 * Returns 401 if user is not authenticated via session, 403 if user lacks admin rights, and 200 with isAdmin flag if authorized. Logs errors and returns 500 on failure.
 * @param req Express request with session data containing user information
 * @param res Express response object for sending HTTP responses
 * @param pool Database connection pool for queries
 * @returns Response object with status code and JSON body indicating authentication status or error
 */
export const checkAdminAccess = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response> => {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const isAdmin = await adminModel.isUserAdmin(pool, userId);

    if (!isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json({ isAdmin: true });
  } catch (error) {
    logger.error({ err: error });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve and return aggregated system statistics including user counts, projects, tasks, and logged time.
 *
 * Responds with status 200 and JSON-formatted statistics on success, or status 500 with an error message if fetching statistics fails.
 * @param req Express request object
 * @param res Express response object for sending the statistics or error response
 * @param pool Database connection pool
 */
export const getSystemStats = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const stats = await adminModel.getSystemStats(pool);
    res.status(200).json(stats);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching system stats');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve system activity logs with optional filtering by date range and activity type.
 *
 * Accepts query parameters for startDate, endDate, and type to filter logs. Returns logs as JSON on success or a 500 error response if log retrieval fails.
 * @param req Request object with SystemLogQuery containing optional startDate, endDate, and type query parameters
 * @param res Response object to send the logs array or error message
 * @param pool Database connection pool for data access
 */
export const getSystemLogs = async (
  req: Request<{}, {}, {}, SystemLogQuery>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const { startDate, endDate, type } = req.query;
    const logs = await adminModel.getSystemLogs(pool, startDate, endDate, type);
    res.status(200).json(logs);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching system logs');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve all system permissions and return them as JSON.
 *
 * Responds with a 200 status and the permissions array on success, or a 500 status with an error message if the fetch fails.
 * @param req Express request object
 * @param res Express response object for sending the permissions or error
 * @param pool Database connection pool for querying permissions
 */
export const getAllPermissions = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const permissions = await adminModel.getAllPermissions(pool);
    res.status(200).json(permissions);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching permissions');
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};
