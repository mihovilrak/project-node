import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { Permission } from '../types/permission';
import { CustomRequest } from '../types/express';
import { hasPermission } from '../models/permissionModel';

export default (pool: Pool, requiredPermission: Permission) => {
  return async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.session.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    try {
      const hasAccess = await hasPermission(pool, userId, requiredPermission);
      if (!hasAccess) {
        res.status(403).json({ error: `Permission denied: ${requiredPermission} required` });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
