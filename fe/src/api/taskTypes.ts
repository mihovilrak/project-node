import { api } from './api';
import { TaskType } from '../types/task';

// Get all task types
export const getTaskTypes = async (): Promise<TaskType[]> => {
  try {
    const response = await api.get('/admin/task-types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task types:', error);
    throw error;
  }
};

// Get task type by id
export const getTaskTypeById = async (id: number): Promise<TaskType> => {
  try {
    const response = await api.get(`/admin/task-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task type:', error);
    throw error;
  }
};

// Create task type
export const createTaskType = async (taskTypeData: Partial<TaskType>): Promise<TaskType> => {
  try {
    const response = await api.post('/admin/task-types', taskTypeData);
    return response.data;
  } catch (error) {
    console.error('Failed to create task type:', error);
    throw error;
  }
};

// Update task type
export const updateTaskType = async (id: number, taskTypeData: Partial<TaskType>): Promise<TaskType> => {
  try {
    const response = await api.put(`/admin/task-types/${id}`, taskTypeData);
    return response.data;
  } catch (error) {
    console.error('Failed to update task type:', error);
    throw error;
  }
};

// Delete task type
export const deleteTaskType = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/task-types/${id}`);
  } catch (error) {
    console.error('Failed to delete task type:', error);
    throw error;
  }
};
