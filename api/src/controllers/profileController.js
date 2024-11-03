const profileModel = require('../models/profileModel');

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

    // Using the database's authentication function to verify the current password
    const verifyResult = await pool.query(
      `SELECT id FROM users 
       WHERE id = $1 
       AND password = crypt($2, password)`,
      [userId, currentPassword]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password using pgcrypto
    await pool.query(
      `UPDATE users 
       SET password = crypt($1, gen_salt('bf', 12)),
           updated_on = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [newPassword, userId]
    );

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 