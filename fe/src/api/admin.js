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
    const response = await api.get('/admin/roles');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch roles', error);
    throw error;
  }
};

export const createRole = async (data) => {
  try {
    const response = await api.post('/admin/roles', {
      name: data.name,
      description: data.description,
      is_active: data.is_active,
      permission_ids: data.permissions // Array of permission IDs
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create role', error);
    throw error;
  }
};

export const updateRole = async (id, data) => {
  try {
    const response = await api.put(`/admin/roles/${id}`, {
      name: data.name,
      description: data.description,
      is_active: data.is_active,
      permission_ids: data.permissions // Array of permission IDs
    });
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

export const createTaskType = async (data) => {
  try {
    const response = await api.post('/admin/task-types', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create task type', error);
    throw error;
  }
};

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