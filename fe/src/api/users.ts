import { api } from './api';
import { User, UserCreate, UserUpdate } from '../types/user';
import { Role } from '../types/role';

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

// Get user by id
export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

// Create user
export const createUser = async (userData: UserCreate): Promise<User> => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (id: number, userData: UserUpdate): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
};

// Change user status
export const changeUserStatus = async (id: number): Promise<User> => {
  try {
    const response = await api.patch(`/users/${id}/status`);
    return response.data;
  } catch (error) {
    console.error('Failed to change user status:', error);
    throw error;
  }
};

// Get user roles
export const getUserRoles = async (id: number): Promise<string[]> => {
  try {
    const response = await api.get(`/users/${id}/roles`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user roles:', error);
    throw error;
  }
};

// Update user roles
export const updateUserRoles = async (id: number, roles: number[]): Promise<void> => {
  try {
    await api.put(`/users/${id}/roles`, { roles });
  } catch (error) {
    console.error('Failed to update user roles:', error);
    throw error;
  }
}; 

// Get all roles
export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    throw error;
  }
};
