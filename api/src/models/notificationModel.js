exports.getNotificationsByUserId = async (pool, user_id) => {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_on DESC',
      [user_id]
    );
    return result.rows;
  };
  
  exports.markNotificationsAsRead = async (pool, user_id) => {
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false RETURNING *',
      [user_id]
    );
    return result.rows;
  };
  