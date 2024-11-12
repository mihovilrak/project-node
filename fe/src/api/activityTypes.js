import api from './api';

export const getActivityTypes = async () => {
  try {
    const response = await api.get('/admin/activity-types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activity types', error);
    throw error;
  }
};

export const createActivityType = async (data) => {
  try {
    const response = await api.post('/admin/activity-types', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create activity type', error);
    throw error;
  }
};

export const updateActivityType = async (id, data) => {
  try {
    const response = await api.put(`/admin/activity-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update activity type', error);
    throw error;
  }
};

export const deleteActivityType = async (id) => {
  try {
    await api.delete(`/admin/activity-types/${id}`);
  } catch (error) {
    console.error('Failed to delete activity type', error);
    throw error;
  }
};

export const getAvailableIcons = async () => {
  try {
    const response = await api.get('/admin/activity-types/icons');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch icons', error);
    throw error;
  }
}; 