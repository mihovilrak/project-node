import axios from 'axios';

export const login = async (email, password) => {
  try {
    const response = await axios.post('/api/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await axios.post('localhost:5000/api/register', { name, email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
