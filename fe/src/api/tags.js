import api from './api';

export const getTags = async () => {
  try {
    const response = await api.get('/tags');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tags', error);
    throw error;
  }
};

export const createTag = async (tagData) => {
  try {
    const response = await api.post('/tags', tagData);
    return response.data;
  } catch (error) {
    console.error('Failed to create tag', error);
    throw error;
  }
};

export const addTaskTags = async (taskId, tagIds) => {
  try {
    const response = await api.post(`/tasks/${taskId}/tags`, { tagIds });
    return response.data;
  } catch (error) {
    console.error('Failed to add tags to task', error);
    throw error;
  }
};

export const removeTaskTag = async (taskId, tagId) => {
  try {
    await api.delete(`/tasks/${taskId}/tags/${tagId}`);
  } catch (error) {
    console.error('Failed to remove tag from task', error);
    throw error;
  }
}; 