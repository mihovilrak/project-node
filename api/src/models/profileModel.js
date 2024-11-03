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
    // Verify current password using pgcrypto
    const result = await pool.query(
      `SELECT id FROM users 
       WHERE id = $1 
       AND password = crypt($2, password)`,
      [userId, currentPassword]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Update password using pgcrypto
    const updateResult = await pool.query(
      `UPDATE users 
       SET password = crypt($1, gen_salt('bf', 12)), 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id`,
      [newPassword, userId]
    );
    
    return updateResult.rows[0];
  };