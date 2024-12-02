import { api } from './api';
import { Tag } from '../types/tags';

// Get all tags
export const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get('/tags');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tags', error);
    throw error;
  }
};

// Create tag
export const createTag = async (tagData: Partial<Tag>): Promise<Tag> => {
  try {
    const response = await api.post('/tags', tagData);
    return response.data;
  } catch (error) {
    console.error('Failed to create tag', error);
    throw error;
  }
};

// Add tags to task
export const addTaskTags = async (taskId: number, tagIds: number[]): Promise<Tag[]> => {
  try {
    const response = await api.post(`/tasks/${taskId}/tags`, { tagIds });
    return response.data;
  } catch (error) {
    console.error('Failed to add tags to task', error);
    throw error;
  }
};

// Remove tag from task
export const removeTaskTag = async (taskId: number, tagId: number): Promise<void> => {
  try {
    await api.delete(`/tasks/${taskId}/tags/${tagId}`);
  } catch (error) {
    console.error('Failed to remove tag from task', error);
    throw error;
  }
};

// Get task tags
export const getTaskTags = async (taskId: number): Promise<Tag[]> => {
  try {
    const response = await api.get(`/tasks/${taskId}/tags`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task tags', error);
    throw error;
  }
}; 