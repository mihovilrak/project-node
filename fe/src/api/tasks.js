import axios from 'axios';

export const getTasksByProject = async (projectId) => {
  try {
    const response = await axios.get(`localhost:5000/api/tasks/project/${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTaskById = async (taskId) => {
  try {
    const response = await axios.get(`localhost:5000/api/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post('localhost:5000/api/tasks', taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const response = await axios.put(`localhost:5000/api/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
