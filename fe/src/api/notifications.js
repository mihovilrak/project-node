import api from './api';

export const getNotifications = async (userId) => {
  try {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications', error);
    throw error;
  }
};

export const markAsRead = async (userId) => {
  try {
    await api.patch(`/notifications/${userId}`);
  } catch (error) {
    console.error('Failed to mark notifications as read', error);
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
