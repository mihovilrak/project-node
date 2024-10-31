import api from './api';

export const getAllActivityTypes = async () => {
  try {
    const response = await api.get('/activity-types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activity types', error);
    throw error;
  }
};

export const createActivityType = async (data) => {
  try {
    const response = await api.post('/activity-types', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create activity type', error);
    throw error;
  }
};

export const updateActivityType = async (id, data) => {
  try {
    const response = await api.put(`/activity-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update activity type', error);
    throw error;
  }
};

export const deleteActivityType = async (id) => {
  try {
    await api.delete(`/activity-types/${id}`);
  } catch (error) {
    console.error('Failed to delete activity type', error);
    throw error;
  }
}; 