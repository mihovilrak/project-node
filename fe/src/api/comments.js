import api from './api';

// Get all comments for a task
export const getTaskComments = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch comments', error);
    throw error;
  }
};

// Create a new comment for a task
export const createComment = async (taskId, data) => {
  try {
    const response = await api.post(`/tasks/${taskId}/comments`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to create comment', error);
    throw error;
  }
};

// Edit a comment
export const editComment = async (id, taskId, data) => {
  try {
    const response = await api.put(`/tasks/${taskId}/comments/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to edit comment', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (taskId, id) => {
  try {
    const response = await api.delete(`/tasks/${taskId}/comments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete comment', error);
    throw error;
  }
};
