import api from './api';

export const getTaskTypes = async () => {
  try {
    const response = await api.get('/tasks/types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task types:', error);
    throw error;
  }
};

export const getTaskTypeById = async (id) => {
  try {
    const response = await api.get(`/tasks/types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task type:', error);
    throw error;
  }
};

export const createTaskType = async (taskTypeData) => {
  try {
    const response = await api.post('/tasks/types', taskTypeData);
    return response.data;
  } catch (error) {
    console.error('Failed to create task type:', error);
    throw error;
  }
};

export const updateTaskType = async (id, taskTypeData) => {
  try {
    const response = await api.put(`/tasks/types/${id}`, taskTypeData);
    return response.data;
  } catch (error) {
    console.error('Failed to update task type:', error);
    throw error;
  }
};

export const deleteTaskType = async (id) => {
  try {
    const response = await api.delete(`/tasks/types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete task type:', error);
    throw error;
  }
}; 