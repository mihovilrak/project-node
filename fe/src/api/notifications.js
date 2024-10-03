import axios from 'axios';

export const getUserNotifications = async (userId) => {
  try {
    const response = await axios.get(`localhost:5000/api/notifications/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`localhost:5000/api/notifications/${notificationId}`, { is_read: true });
    return response.data;
  } catch (error) {
    throw error;
  }
};
