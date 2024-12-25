import { api } from './api';
import {
  TimeLog,
  TimeLogCreate,
  TimeSpent
} from '../types/timeLog';

// Get all time logs (admin only)
export const getAllTimeLogs = async (): Promise<TimeLog[]> => {
  try {
    const response = await api.get('/time-logs');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch time logs', error);
    throw error;
  }
};

// Get task time logs
export const getTaskTimeLogs = async (taskId: number): Promise<TimeLog[]> => {
  try {
    const response = await api.get(`/time-logs/tasks/${taskId}/logs`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task time logs', error);
    throw error;
  }
};

// Get task spent time
export const getTaskSpentTime = async (taskId: number): Promise<TimeSpent> => {
  try {
    const response = await api.get(`/time-logs/tasks/${taskId}/spent-time`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task spent time', error);
    throw error;
  }
};

// Get project time logs
export const getProjectTimeLogs = async (projectId: number, params?: Record<string, any>): Promise<TimeLog[]> => {
  try {
    const response = await api.get(`/time-logs/projects/${projectId}/logs`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project time logs', error);
    throw error;
  }
};

// Get project spent time
export const getProjectSpentTime = async (projectId: number): Promise<TimeSpent> => {
  try {
    const response = await api.get(`/time-logs/projects/${projectId}/spent-time`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project spent time', error);
    throw error;
  }
};

// Create time log
export const createTimeLog = async (taskId: number, timeLog: TimeLogCreate): Promise<TimeLog> => {
  try {
    const response = await api.post(`/time-logs/tasks/${taskId}/logs`, {
      log_date: timeLog.log_date,
      spent_time: timeLog.spent_time,
      description: timeLog.description,
      activity_type_id: timeLog.activity_type_id
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create time log', error);
    throw error;
  }
};

// Get user time logs
export const getUserTimeLogs = async (params?: Record<string, any>): Promise<TimeLog[]> => {
  try {
    const response = await api.get('/time-logs/user/logs', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user time logs', error);
    throw error;
  }
};

// Update time log
export const updateTimeLog = async (timeLogId: number, timeLog: TimeLogCreate): Promise<TimeLog> => {
  try {
    const response = await api.put(`/time-logs/${timeLogId}`, {
      log_date: timeLog.log_date,
      spent_time: timeLog.spent_time,
      description: timeLog.description,
      activity_type_id: timeLog.activity_type_id
    });
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
