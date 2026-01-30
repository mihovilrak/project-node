import { api } from './api';
import { Permission } from '../types/admin';
import logger from '../utils/logger';

// Get all permissions
export const getAllPermissions = async (): Promise<Permission[]> => {
  try {
    const response = await api.get('/admin/permissions');
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch permissions', error);
    throw error;
  }
};
