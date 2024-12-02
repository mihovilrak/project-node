import { api } from './api';
import { TaskType } from '../types/task';
import { ActivityType } from '../types/timeLog';
import { Permission, Role } from '../types/admin';

// Get all permissions
export const getAllPermissions = async (): Promise<Permission[]> => {
  try {
    const response = await api.get('/admin/permissions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch permissions', error);
    throw error;
  }
};

// Get roles with permissions
export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch roles', error);
    throw error;
  }
};

// Create role
export const createRole = async (roleData: Partial<Role>): Promise<Role> => {
  try {
    const response = await api.post('/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('Failed to create role', error);
    throw error;
  }
};

// Update role
export const updateRole = async (id: number, roleData: Partial<Role>): Promise<Role> => {
  try {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Failed to update role', error);
    throw error;
  }
};

// Get task types
export const getTaskTypes = async (): Promise<TaskType[]> => {
  try {
    const response = await api.get('/admin/task-types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task types', error);
    throw error;
  }
};

// Create task type
export const createTaskType = async (data: Partial<TaskType>): Promise<TaskType> => {
  try {
    const response = await api.post('/admin/task-types', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create task type', error);
    throw error;
  }
};

// Update task type
export const updateTaskType = async (id: number, data: Partial<TaskType>): Promise<TaskType> => {
  try {
    const response = await api.put(`/admin/task-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update task type', error);
    throw error;
  }
};

// Delete task type
export const deleteTaskType = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/task-types/${id}`);
  } catch (error) {
    console.error('Failed to delete task type', error);
    throw error;
  }
};

// Get activity types
export const getActivityTypes = async (): Promise<ActivityType[]> => {
  try {
    const response = await api.get('/admin/activity-types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activity types', error);
    throw error;
  }
};

// Create activity type
export const createActivityType = async (data: Partial<ActivityType>): Promise<ActivityType> => {
  try {
    const response = await api.post('/admin/activity-types', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create activity type', error);
    throw error;
  }
};

// Update activity type
export const updateActivityType = async (id: number, data: Partial<ActivityType>): Promise<ActivityType> => {
  try {
    const response = await api.put(`/admin/activity-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update activity type', error);
    throw error;
  }
};

// Delete activity type
export const deleteActivityType = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/activity-types/${id}`);
  } catch (error) {
    console.error('Failed to delete activity type', error);
    throw error;
  }
};