const adminModel = require('../models/adminModel');

// Check if user is admin
exports.checkAdminAccess = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const isAdmin = await adminModel.isUserAdmin(pool, userId);
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Pass control to next middleware if user is admin
    return true;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
    return false;
  }
};

// Get system statistics
exports.getSystemStats = async (req, res, pool) => {
  try {
    const stats = await adminModel.getSystemStats(pool);
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get system logs
exports.getSystemLogs = async (req, res, pool) => {
  try {
    const { startDate, endDate, type } = req.query;
    const logs = await adminModel.getSystemLogs(pool, startDate, endDate, type);
    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};