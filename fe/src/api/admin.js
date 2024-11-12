import api from './api';

// Permissions
export const getAllPermissions = async () => {
  try {
    const response = await api.get('/admin/permissions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch permissions', error);
    throw error;
  }
};

// Roles with permissions
export const getRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch roles', error);
    throw error;
  }
};

// Create role
export const createRole = async (roleData) => {
  try {
    const response = await api.post('/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('Failed to create role', error);
    throw error;
  }
};

// Update role
export const updateRole = async (id, roleData) => {
  try {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Failed to update role', error);
    throw error;
  }
};

// Task Types
export const getTaskTypes = async () => {
  try {
    const response = await api.get('/admin/task-types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task types', error);
    throw error;
  }
};

// Create task type
export const createTaskType = async (data) => {
  try {
    const response = await api.post('/admin/task-types', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create task type', error);
    throw error;
  }
};

// Update task type
export const updateTaskType = async (id, data) => {
  try {
    const response = await api.put(`/admin/task-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update task type', error);
    throw error;
  }
};

// Activity Types
export const getActivityTypes = async () => {
  try {
    const response = await api.get('/admin/activity-types');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activity types', error);
    throw error;
  }
};

// Create activity type
export const createActivityType = async (data) => {
  try {
    const response = await api.post('/admin/activity-types', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create activity type', error);
    throw error;
  }
};

export const updateActivityType = async (id, data) => {
  try {
    const response = await api.put(`/admin/activity-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update activity type', error);
    throw error;
  }
};