import { api } from './api';
import { TimeLog, TimeLogCreate } from '../types/timeLog';

// Get task time logs
export const getTaskTimeLogs = async (taskId: number): Promise<TimeLog[]> => {
  try {
    const response = await api.get(`/tasks/${taskId}/time-logs`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task time logs', error);
    throw error;
  }
};

// Create time log
export const createTimeLog = async (taskId: number, timeLog: TimeLogCreate): Promise<TimeLog> => {
  try {
    const response = await api.post(`/tasks/${taskId}/time-logs`, timeLog);
    return response.data;
  } catch (error) {
    console.error('Failed to create time log', error);
    throw error;
  }
};

// Update time log
export const updateTimeLog = async (timeLogId: number, timeLog: TimeLogCreate): Promise<TimeLog> => {
  try {
    const response = await api.put(`/time-logs/${timeLogId}`, timeLog);
    return response.data;
  } catch (error) {
    console.error('Failed to update time log', error);
    throw error;
  }
};

// Delete time log
export const deleteTimeLog = async (timeLogId: number): Promise<void> => {
  try {
    await api.delete(`/time-logs/${timeLogId}`);
  } catch (error) {
    console.error('Failed to delete time log', error);
    throw error;
  }
}; 