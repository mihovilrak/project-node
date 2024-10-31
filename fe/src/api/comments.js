import api from './api';

export const getTaskComments = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch comments', error);
    throw error;
  }
};

export const createComment = async (taskId, data) => {
  try {
    const response = await api.post(`/tasks/${taskId}/comments`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to create comment', error);
    throw error;
  }
};
