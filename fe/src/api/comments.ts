import { api } from './api';
import { Comment } from '../types/comment';

// Get task comments
export const getTaskComments = async (taskId: number): Promise<Comment[]> => {
  try {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch comments', error);
    throw error;
  }
};

// Create comment
export const createComment = async (taskId: number, data: { comment: string }): Promise<Comment> => {
  try {
    const response = await api.post(`/tasks/${taskId}/comments`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to create comment', error);
    throw error;
  }
};

// Edit comment
export const editComment = async (id: number, taskId: number, data: { comment: string }): Promise<Comment> => {
  try {
    const response = await api.put(`/tasks/${taskId}/comments/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to edit comment', error);
    throw error;
  }
};

// Delete comment
export const deleteComment = async (taskId: number, id: number): Promise<void> => {
  try {
    await api.delete(`/tasks/${taskId}/comments/${id}`);
  } catch (error) {
    console.error('Failed to delete comment', error);
    throw error;
  }
};
