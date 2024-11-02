const notificationModel = require('../models/notificationModel');

// Get user notifications
exports.getUserNotifications = async (req, res, pool) => {
  const { user_id } = req.params;
  try {
    const notifications = await notificationModel.getNotificationsByUserId(pool, user_id);
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notifications as read
exports.markAsRead = async (req, res, pool) => {
  const { user_id } = req.params;
  try {
    const updatedNotifications = await notificationModel.markNotificationsAsRead(pool, user_id);
    res.status(200).json(updatedNotifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};