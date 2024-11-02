exports.getProfile = async (pool, userId) => {
    const result = await pool.query(
      `SELECT id, login, email, first_name, last_name, 
              phone, role_id, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );
    return result.rows[0];
  };
  
  exports.updateProfile = async (pool, userId, profileData) => {
    const { email, first_name, last_name, phone } = profileData;
    
    const result = await pool.query(
      `UPDATE users 
       SET email = $1, 
           first_name = $2, 
           last_name = $3, 
           phone = $4, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING id, login, email, first_name, last_name, phone, role_id`,
      [email, first_name, last_name, phone, userId]
    );
    return result.rows[0];
  };
  
  exports.changePassword = async (pool, userId, currentPassword, newPassword) => {
    // First verify current password
    const user = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );
  
    const isValid = await bcrypt.compare(currentPassword, user.rows[0].password);
    
    if (!isValid) {
      return null;
    }
  
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
  
    // Update password
    const result = await pool.query(
      `UPDATE users 
       SET password = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id`,
      [hashedPassword, userId]
    );
    
    return result.rows[0];
  };