import { api } from './api';
import { Role } from '../types/role';

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

// Delete role
export const deleteRole = async (id: number): Promise<void> => {
  try {
    await api.delete(`/roles/${id}`);
  } catch (error) {
    console.error('Failed to delete role', error);
    throw error;
  }
};
