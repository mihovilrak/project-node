// Get notifications by user ID
exports.getNotificationsByUserId = async (pool, user_id) => {
  const result = await pool.query(
    `SELECT * FROM notifications 
    WHERE user_id = $1 
    ORDER BY created_on DESC`,
    [user_id]
  );
  return result.rows;
};

// Mark notifications as read
exports.markNotificationsAsRead = async (pool, user_id) => {
  const result = await pool.query(
    `UPDATE notifications 
    SET (is_read, read_on) = (true, current_timestamp) 
    WHERE user_id = $1 
    AND is_read = false 
    RETURNING *`,
    [user_id]
  );
  return result.rows;
};

// Delete notification
exports.deleteNotification = async (pool, id) => {
  const result = await pool.query(
    `UPDATE notifications SET active = false WHERE id = $1`,
    [id]
  );
  return result.rows;
};

