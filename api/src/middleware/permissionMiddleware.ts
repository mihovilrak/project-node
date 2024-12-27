import { Request, Response, NextFunction } from 'express';
import { DatabasePool } from '../types/models';
import { Permission } from '../types/permission';
import { CustomRequest } from '../types/express';
import { hasPermission } from '../models/permissionModel';

export default (pool: DatabasePool, requiredPermission: Permission) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    const userId = req.session.user?.id;

    console.log('Session check - Session:', req.session);
    console.log('Session check - User:', req.session?.user);
    
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    hasPermission(pool, userId, requiredPermission)
      .then(hasAccess => {
        if (!hasAccess) {
          res.status(403).json({ error: `Permission denied: ${requiredPermission} required` });
          return;
        }
        next();
      })
      .catch(error => {
        console.error('Permission check failed:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
  };
}
