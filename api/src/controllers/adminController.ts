import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as adminModel from '../models/adminModel';
import { hasPermission } from '../models/permissionModel';
import { CustomRequest } from '../types/express';
import { parsePagination } from '../utils/pagination';
import { parsePositiveInteger } from '../utils/requestParsing';
import { sessionUserId } from '../utils/sessionUser';

/**
 * Report whether the signed-in user holds the Admin permission.
 *
 * @param req Express request with session data containing user information
 * @param res 200 with `{ isAdmin: true }`, or 403
 * @param pool Database connection pool for queries
 */
export const checkAdminAccess = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response> => {
  const isAdmin = await hasPermission(pool, sessionUserId(req), 'Admin');
  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }
  return res.status(200).json({ isAdmin: true });
};

/**
 * Retrieve aggregated system statistics including user counts, projects, tasks,
 * and logged time.
 *
 * @param req Express request object
 * @param res Express response object for sending the statistics
 * @param pool Database connection pool
 */
export const getSystemStats = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const stats = await adminModel.getSystemStats(pool);
  res.status(200).json(stats);
};

/**
 * Retrieve a page of time logs across all users, filtered by date range and
 * activity type.
 *
 * Query parameters: `startDate`, `endDate`, `type` (activity type id), `limit`
 * and `offset`.
 *
 * @param req Request with the filter and pagination query parameters
 * @param res Response with the log rows, or 400 for a bad activity type id
 * @param pool Database connection pool for data access
 */
export const getTimeLogReport = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { startDate, endDate, type } = req.query;
  let typeId: number | undefined;
  if (type !== undefined && type !== '') {
    const parsed = parsePositiveInteger(type);
    if (parsed === null) {
      return res.status(400).json({ error: 'Invalid activity type id' });
    }
    typeId = parsed;
  }
  const logs = await adminModel.getTimeLogReport(
    pool,
    {
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
      type: typeId,
    },
    parsePagination(req.query),
  );
  res.status(200).json(logs);
};

/**
 * Retrieve all system permissions.
 *
 * @param req Express request object
 * @param res Express response object for sending the permissions
 * @param pool Database connection pool for querying permissions
 */
export const getAllPermissions = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const permissions = await adminModel.getAllPermissions(pool);
  res.status(200).json(permissions);
};
