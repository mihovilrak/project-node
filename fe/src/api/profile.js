import api from './api';

export const getRecentTasks = async () => {
  try {
    const response = await api.get('/profile/tasks');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent tasks', error);
    throw error;
  }
};

export const getRecentProjects = async () => {
  try {
    const response = await api.get('/profile/projects');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent projects', error);
    throw error;
  }
}; 