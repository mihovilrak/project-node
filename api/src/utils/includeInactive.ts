import { Pool } from 'pg';
import { hasPermission } from '../models/permissionModel';
import { CustomRequest } from '../types/express';
import { sessionUserId } from './sessionUser';

/**
 * True when the request asks for `?include_inactive=true` and the session user
 * is an admin. Non-admins silently get active rows only.
 */
export const includeInactive = async (
  req: CustomRequest,
  pool: Pool,
): Promise<boolean> => {
  if (req.query?.include_inactive !== 'true') return false;
  return hasPermission(pool, sessionUserId(req), 'Admin');
};
