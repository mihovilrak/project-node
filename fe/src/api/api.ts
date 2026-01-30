import axios, { AxiosInstance } from 'axios';

export const api: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const config = error.config;
    const isLoginRequest = config?.url?.includes('/login') && config?.method?.toLowerCase() === 'post';
    const alreadyOnLogin = typeof window !== 'undefined' && window.location.pathname === '/login';
    if (status === 401 && !isLoginRequest && !alreadyOnLogin) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
