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
    `UPDATE notifications 
    SET active = false
    WHERE id = $1`,
    [id]
  );
  return result.rows;
};

// Create watcher notifications
exports.createWatcherNotifications = async (pool, { task_id, action_user_id, type_id }) => {
  const result = await pool.query(
    `WITH task_info AS (
      SELECT 
        t.name as task_name,
        t.description,
        p.name as project_name,
        u.name as action_user_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON u.id = $2
      WHERE t.id = $1
    )
    INSERT INTO notifications (
      user_id,
      title,
      message,
      link,
      type_id,
      active,
      created_on
    )
    SELECT 
      w.user_id,
      CASE 
        WHEN $3 = 'task_updated' THEN 'Task Updated'
        WHEN $3 = 'task_commented' THEN 'New Comment'
        WHEN $3 = 'task_status_changed' THEN 'Status Changed'
      END,
      action_user_name || ' ' || 
      CASE 
        WHEN $3 = 'task_updated' THEN 'updated'
        WHEN $3 = 'task_commented' THEN 'commented on'
        WHEN $3 = 'task_status_changed' THEN 'changed status of'
      END || 
      ' task "' || task_name || '" in project "' || project_name || '"',
      '/tasks/' || $1,
      $3,
      true,
      CURRENT_TIMESTAMP
    FROM watchers w
    CROSS JOIN task_info
    WHERE w.task_id = $1
    AND w.user_id != $2
    RETURNING *`,
    [task_id, action_user_id, type_id]
  );
  return result.rows;
};
