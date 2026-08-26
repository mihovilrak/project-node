import { api } from './api';
import { Notification } from '../types/notification';
import logger from '../utils/logger';

// Get the current user's notifications. The owner is resolved from the session
// server-side, so no user id is sent.
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch notifications:', error);
    throw error;
  }
};

// Mark one notification as read, or all of them when no id is given
export const markAsRead = async (notificationId?: number): Promise<void> => {
  try {
    await api.patch('/notifications', notificationId ? { notification_id: notificationId } : {});
  } catch (error) {
    logger.error('Failed to mark notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: number): Promise<void> => {
  try {
    await api.delete(`/notifications/${notificationId}`);
  } catch (error) {
    logger.error('Failed to delete notification:', error);
    throw error;
  }
};
