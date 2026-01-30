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
    if (status === 401 && !isLoginRequest) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
