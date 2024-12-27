import { api } from './api';
import { TaskWatcher } from '../types/watcher';

// Get task watchers
export const getTaskWatchers = async (taskId: number): Promise<TaskWatcher[]> => {
  try {
    const response = await api.get(`/tasks/${taskId}/watchers`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task watchers', error);
    throw error;
  }
  };
  
// Add task watcher
export const addTaskWatcher = async (taskId: number, userId: number): Promise<TaskWatcher> => {
  try {
    const response = await api.post(`/tasks/${taskId}/watchers`, { userId });
    return response.data;
  } catch (error) {
    console.error('Failed to add task watcher', error);
    throw error;
  }
  };
  
// Remove task watcher
export const removeTaskWatcher = async (taskId: number, userId: number): Promise<void> => {
  try {
    await api.delete(`/tasks/${taskId}/watchers/${userId}`);
  } catch (error) {
    console.error('Failed to remove task watcher', error);
    throw error;
  }
};
