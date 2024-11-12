import api from './api';

export const getAllTimeLogs = async () => {
  try {
    const response = await api.get('/time-logs');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all time logs', error);
    throw error;
  }
};

export const getTaskTimeLogs = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}/time-logs`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task time logs', error);
    throw error;
  }
};

export const getTaskSpentTime = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}/spent-time`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task spent time', error);
    throw error;
  }
};

export const getProjectTimeLogs = async (projectId, params) => {
  try {
    const response = await api.get(`/projects/${projectId}/time-logs`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project time logs', error);
    throw error;
  }
};

export const getProjectSpentTime = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/spent-time`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project spent time', error);
    throw error;
  }
};

export const createTimeLog = async (taskId, timeLogData) => {
  try {
    const response = await api.post(`/tasks/${taskId}/time-logs`, timeLogData);
    return response.data;
  } catch (error) {
    console.error('Failed to create time log', error);
    throw error;
  }
};

export const updateTimeLog = async (timeLogId, timeLogData) => {
  try {
    const response = await api.put(`/time-logs/${timeLogId}`, timeLogData);
    return response.data;
  } catch (error) {
    console.error('Failed to update time log', error);
    throw error;
  }
};

export const deleteTimeLog = async (timeLogId) => {
  try {
    await api.delete(`/time-logs/${timeLogId}`);
  } catch (error) {
    console.error('Failed to delete time log', error);
    throw error;
  }
};

export const getUserTimeLogs = async (params) => {
  try {
    const response = await api.get('/user/time-logs', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user time logs', error);
    throw error;
  }
};