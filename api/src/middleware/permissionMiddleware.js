const { hasPermission } = require('../models/permissionModel');

exports.checkPermission = (pool, requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.session.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const hasAccess = await hasPermission(pool, userId, requiredPermission);
      
      if (!hasAccess) {
        return res.status(403).json({ error: `Permission denied: ${requiredPermission} required` });
      }

      next();
    } catch (error) {
      console.error('Permission check failed:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};