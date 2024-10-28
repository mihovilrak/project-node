import api from './api';

// Get all tasks
export const getTasks = async () => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Get task by ID
export const getTaskById = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Create new task
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Edit a task
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.put(
      `/tasks/${taskId}`,
      taskData
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Change task status
export const changeTaskStatus = async (taskId, status) => {
  try {
    const response = await api.patch(
      `tasks/${taskId}/status`,
      status
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Delete task
export const deleteTask = async (taskId) => {
  try {
    const response = api.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Get tasks statuses
export const getTaskStatuses = async () => {
  try {
    const response = await api.get('/tasks/statuses');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Get tasks priorities
export const getPriorities = async () => {
  try {
    const response = await api.get('/tasks/priorities');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};