// src/api/users.js

import api from './api';

// Fetch roles
export const fetchRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch roles', error);
  }
};

// Fetch all users
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Fetch a single user by ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
