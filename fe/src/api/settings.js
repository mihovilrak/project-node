import api from './api';

// Using existing profile routes for user settings
export const getSystemSettings = async () => {
  try {
    const response = await api.get('/settings/system');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    throw error;
  }
};

// Update system settings
export const updateSystemSettings = async (settings) => {
  try {
    const response = await api.put('/settings/system', settings);
    return response.data;
  } catch (error) {
    console.error('Failed to update system settings:', error);
    throw error;
  }
};

// Get user settings
export const getUserSettings = async () => {
  try {
    const response = await api.get('/settings/user');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
    throw error;
  }
};

// Update user settings
export const updateUserSettings = async (settings) => {
  try {
    const response = await api.put('/settings/user', settings);
    return response.data;
  } catch (error) {
    console.error('Failed to update user settings:', error);
    throw error;
  }
};

// Get notification settings
export const getNotificationSettings = async () => {
  try {
    const response = await api.get('/profile/notifications/settings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification settings:', error);
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await api.put('/profile/notifications/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    throw error;
  }
}; 