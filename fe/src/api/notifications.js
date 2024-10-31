import api from './api';

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications', error);
    throw error;
  }
};

export const markAsRead = async (notificationId) => {
  try {
    await api.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Failed to mark notification as read', error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    await api.patch('/notifications/read-all');
  } catch (error) {
    console.error('Failed to mark all notifications as read', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await api.delete(`/notifications/${notificationId}`);
  } catch (error) {
    console.error('Failed to delete notification', error);
    throw error;
  }
};
