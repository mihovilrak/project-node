import { Response, NextFunction, RequestHandler } from 'express';
import { Pool } from 'pg';
import { CustomRequest } from '../types/express';
import { hasPermission } from '../models/permissionModel';
import { isProjectMember, isTaskProjectMember } from '../models/accessModel';

type IdResolver = (req: CustomRequest) => string | undefined;
type MembershipCheck = (
  pool: Pool,
  id: string,
  userId: string,
) => Promise<boolean>;

// Route params come first, then the request body (creates carry the id there),
// then the query string (the file routes pass ?taskId=).
const fromKey =
  (key: string): IdResolver =>
  (req) => {
    const sources: Array<Record<string, unknown> | undefined> = [
      req.params as Record<string, unknown> | undefined,
      req.body as Record<string, unknown> | undefined,
      req.query as Record<string, unknown> | undefined,
    ];
    for (const source of sources) {
      const value = source?.[key];
      if (value !== undefined && value !== null && value !== '') {
        return String(value);
      }
    }
    return undefined;
  };

const guard = (
  pool: Pool,
  resolveId: IdResolver,
  isMember: MembershipCheck,
): RequestHandler => {
  return (async (
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const userId = req.session?.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = resolveId(req);
    if (!id || !/^\d+$/.test(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    try {
      if (await hasPermission(pool, userId, 'Admin')) {
        next();
        return;
      }
      if (!(await isMember(pool, id, userId))) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  }) as RequestHandler;
};

// Require membership of the project named by `key`
export const requireProjectAccess = (pool: Pool, key = 'id'): RequestHandler =>
  guard(pool, fromKey(key), isProjectMember);

// Require membership of the project owning the task named by `key`
export const requireTaskAccess = (pool: Pool, key = 'id'): RequestHandler =>
  guard(pool, fromKey(key), isTaskProjectMember);

export const requireTaskAccessBy = (
  pool: Pool,
  resolveId: IdResolver,
): RequestHandler => guard(pool, resolveId, isTaskProjectMember);
