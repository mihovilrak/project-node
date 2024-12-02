const { hasPermission } = require('../models/permissionModel');
//const { isUserAdmin } = require('../models/adminModel');

exports.checkPermission = (pool, requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.session.user?.id;

      console.log('Session check - Session:', req.session);
  console.log('Session check - User:', req.session?.user);
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      /*const isAdmin = await isUserAdmin(pool, userId);
      
      if (isAdmin) {
        return next();
      }*/

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