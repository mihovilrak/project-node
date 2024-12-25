import { api } from './api';
import { Permission } from '../types/admin';

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
