import api from './api';

// Get user profile 
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user profile', error);
    throw error;
  }
};

// Change user password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/profile/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Failed to change user password', error);
    throw error;
  }
};

// Get recent tasks
export const getRecentTasks = async () => {
  try {
    const response = await api.get('/profile/tasks');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent tasks', error);
    throw error;
  }
};

// Get recent projects
export const getRecentProjects = async () => {
  try {
    const response = await api.get('/profile/projects');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent projects', error);
    throw error;
  }
}; 