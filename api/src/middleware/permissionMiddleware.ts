import { Request, Response, NextFunction } from 'express';
import { DatabasePool } from '../types/models';
import { Permission } from '../types/permission';
import { CustomRequest } from '../types/express';
import { hasPermission } from '../models/permissionModel';

export function checkPermission(pool: DatabasePool, requiredPermission: Permission) {
  return async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.session.user?.id;

      console.log('Session check - Session:', req.session);
      console.log('Session check - User:', req.session?.user);
      
      if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const hasAccess = await hasPermission(pool, userId, requiredPermission);
      
      if (!hasAccess) {
        res.status(403).json({ error: `Permission denied: ${requiredPermission} required` });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check failed:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
