import { Pool } from 'pg';
import { hasPermission } from '../models/permissionModel';
import { CustomRequest } from '../types/express';

/**
 * True when the request asks for `?include_inactive=true` and the session user
 * is an admin. Non-admins silently get active rows only.
 */
export const includeInactive = async (
  req: CustomRequest,
  pool: Pool,
): Promise<boolean> => {
  if (req.query?.include_inactive !== 'true') return false;
  const userId = req.session?.user?.id;
  if (userId === undefined || userId === null || userId === '') return false;
  return hasPermission(pool, String(userId), 'Admin');
};
