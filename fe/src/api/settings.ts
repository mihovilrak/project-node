import { api } from './api';
import { 
  SystemSettings, 
  NotificationSettings 
} from '../types/settings';

// Get system settings
export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const response = await api.get('/settings/system');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    throw error;
  }
};

// Update system settings
export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  try {
    const response = await api.put('/settings/system', settings);
    return response.data;
  } catch (error) {
    console.error('Failed to update system settings:', error);
    throw error;
  }
};

// Get notification settings
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const response = await api.get('/settings/notifications');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notification settings:', error);
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
  try {
    const response = await api.put('/settings/notifications', settings);
    return response.data;
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    throw error;
  }
}; 