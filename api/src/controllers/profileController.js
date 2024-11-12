const profileModel = require('../models/profileModel');

// Get user profile
exports.getProfile = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated'
      });
    }

    const profile = await profileModel.getProfile(pool, userId);
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    const profileData = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated'
      });
    }

    const profile = await profileModel.updateProfile(pool, userId, profileData);
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Change user password
exports.changePassword = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated'
      });
    }

    // Verify current password
    const verifyResult = await profileModel.verifyPassword(pool, userId, currentPassword);

    if (!verifyResult) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    const updatedUser = await profileModel.changePassword(pool, userId, newPassword);
    res.status(200).json({
      message: `Password updated successfully on ${updatedUser.updated_on}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get recent tasks
exports.getRecentTasks = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated'
      });
    }

    const tasks = await profileModel.getRecentTasks(pool, userId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get recent projects
exports.getRecentProjects = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const projects = await profileModel.getRecentProjects(pool, userId);
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}; 