const settingsModel = require('../models/settingsModel');

// Get System Settings
exports.getSystemSettings = async (req, res, pool) => {
  try {
    const settings = await settingsModel.getSystemSettings(pool);
    res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update System Settings
exports.updateSystemSettings = async (req, res, pool) => {
  try {
    const settings = await settingsModel.updateSystemSettings(pool, req.body);
    res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get User Settings
exports.getUserSettings = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const settings = await settingsModel.getUserSettings(pool, userId);
    res.status(200).json(settings || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update User Settings
exports.updateUserSettings = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const settings = await settingsModel.updateUserSettings(pool, userId, req.body);
    res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};