const profileModel = require('../models/profileModel');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const profile = await profileModel.getProfile(pool, userId);
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    const profileData = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const profile = await profileModel.updateProfile(pool, userId, profileData);
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.changePassword = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await profileModel.changePassword(
      pool, 
      userId, 
      currentPassword, 
      newPassword
    );

    if (!result) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 