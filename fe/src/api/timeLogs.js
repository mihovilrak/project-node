import api from './api';

export const getTaskTimeLogs = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}/time-logs`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch time logs', error);
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

export const updateTimeLog = async (taskId, timeLogId, timeLogData) => {
  try {
    const response = await api.put(
      `/tasks/${taskId}/time-logs/${timeLogId}`, 
      timeLogData
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update time log', error);
    throw error;
  }
};

export const deleteTimeLog = async (taskId, timeLogId) => {
  try {
    await api.delete(`/tasks/${taskId}/time-logs/${timeLogId}`);
  } catch (error) {
    console.error('Failed to delete time log', error);
    throw error;
  }
};

export const getUserTimeLogs = async (params) => {
  try {
    const response = await api.get('/time-logs', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user time logs:', error);
    throw error;
  }
}; 