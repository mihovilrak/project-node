import { api } from './api';
import { User } from '../types/user';
import { Task } from '../types/task';
import { Project } from '../types/project';
import {
  ProfileData,
  ProfileUpdateData,
  PasswordChange
} from '../types/profile';

// Get user profile
export const getProfile = async (): Promise<ProfileData> => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData: ProfileUpdateData): Promise<User> => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user profile', error);
    throw error;
  }
};

// Change user password
export const changePassword = async (passwordData: PasswordChange): Promise<void> => {
  try {
    await api.put('/profile/password', passwordData);
  } catch (error) {
    console.error('Failed to change user password', error);
    throw error;
  }
};

// Get recent tasks
export const getRecentTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get('/profile/tasks');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent tasks', error);
    throw error;
  }
};

// Get recent projects
export const getRecentProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get('/profile/projects');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent projects', error);
    throw error;
  }
};
