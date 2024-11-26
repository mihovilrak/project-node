import { api } from './api';
import { TimeLog, 
  TimeLogCreate, 
  TimeSpent, 
  ProjectTimeSpent 
} from '../types/timeLog';

// Get time logs by task
export const getTimeLogsByTask = async (taskId: number): Promise<TimeLog[]> => {
  try {
    const response = await api.get(`/tasks/${taskId}/time-logs`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch time logs by task', error);
    throw error;
  }
};

// Get time logs by project
export const getTimeLogsByProject = async (projectId: number): Promise<TimeLog[]> => {
  try {
    const response = await api.get(`/projects/${projectId}/time-logs`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch time logs by project', error);
    throw error;
  }
};

// Get task spent time
export const getTaskSpentTime = async (taskId: number): Promise<TimeSpent> => {
  try {
    const response = await api.get(`/tasks/${taskId}/spent-time`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task spent time', error);
    throw error;
  }
};

// Get project spent time
export const getProjectSpentTime = async (projectId: number): Promise<ProjectTimeSpent> => {
  try {
    const response = await api.get(`/projects/${projectId}/spent-time`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project spent time', error);
    throw error;
  }
};

// Create time log
export const createTimeLog = async (timeLog: TimeLogCreate): Promise<TimeLog> => {
  try {
    const response = await api.post('/time-logs', timeLog);
    return response.data;
  } catch (error) {
    console.error('Failed to create time log', error);
    throw error;
  }
};

// Update time log
export const updateTimeLog = async (id: number, timeLog: TimeLogCreate): Promise<TimeLog> => {
  try {
    const response = await api.put(`/time-logs/${id}`, timeLog);
    return response.data;
  } catch (error) {
    console.error('Failed to update time log', error);
    throw error;
  }
};

// Delete time log
export const deleteTimeLog = async (id: number): Promise<void> => {
  try {
    await api.delete(`/time-logs/${id}`);
  } catch (error) {
    console.error('Failed to delete time log', error);
    throw error;
  }
}; 