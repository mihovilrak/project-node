import { api } from './api';
import { ActivityType } from '../types/timeLog';

// Get activity types
export const getActivityTypes = async (): Promise<ActivityType[]> => {
  try {
    const response = await api.get('/admin/activity-types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activity types', error);
    throw error;
  }
};

// Create activity type
export const createActivityType = async (data: Partial<ActivityType>): Promise<ActivityType> => {
  try {
    const response = await api.post('/admin/activity-types', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create activity type', error);
    throw error;
  }
};

// Update activity type
export const updateActivityType = async (id: number, data: Partial<ActivityType>): Promise<ActivityType> => {
  try {
    const response = await api.put(`/admin/activity-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update activity type', error);
    throw error;
  }
};

// Delete activity type
export const deleteActivityType = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/activity-types/${id}`);
  } catch (error) {
    console.error('Failed to delete activity type', error);
    throw error;
  }
};
