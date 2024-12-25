import { api } from './api';
import { Task, 
  TaskStatus,
  TaskPriority, 
  TaskFilters,
  TaskFormState
} from '../types/task';
import { Tag } from '../types/tag';
import { ApiResponse } from '../types/api';

// Get all tasks
export const getTasks = async (filters: TaskFilters = {}): Promise<Task[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/tasks?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw error;
  }
};

// Get task by id
export const getTaskById = async (id: number): Promise<Task> => {
  try {
    const response = await api.get(`tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

// Create task
export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  try {
    const response = await api.post('tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update task
export const updateTask = async (taskId: number, data: Partial<TaskFormState>): Promise<ApiResponse<Task>> => {
  try {
    const response = await api.put(`tasks/${taskId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete task
export const deleteTask = async (id: number): Promise<void> => {
  try {
    await api.delete(`tasks/${id}`);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Get project tasks
export const getProjectTasks = async (projectId: number, filters: TaskFilters = {}): Promise<Task[]> => {
  try {
    const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
    const url = `/projects/${projectId}/tasks${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project tasks:', error);
    throw error;
  }
};

// Get subtasks
export const getSubtasks = async (parentTaskId: number): Promise<Task[]> => {
  try {
    const response = await api.get(`/tasks/${parentTaskId}/subtasks`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subtasks', error);
    throw error;
  }
};

// Get tasks by date range
export const getTasksByDateRange = async (startDate: Date, endDate: Date): Promise<Task[]> => {
  try {
    const response = await api.get('/tasks/calendar', {
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tasks for calendar', error);
    throw error;
  }
};

// Update task dates
export const updateTaskDates = async (taskId: number, dates: { start_date?: string; due_date?: string }): Promise<Task> => {
  try {
    const response = await api.patch(`/tasks/${taskId}/dates`, dates);
    return response.data;
  } catch (error) {
    console.error('Failed to update task dates', error);
    throw error;
  }
};

// Get active tasks
export const getActiveTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get('/tasks/active');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch active tasks:', error);
    throw error;
  }
};

// Change task status
export const changeTaskStatus = async (taskId: number, statusId: number): Promise<Task> => {
  try {
    const response = await api.patch(`/tasks/${taskId}/status`, { statusId });
    return response.data;
  } catch (error) {
    console.error('Failed to change task status:', error);
    throw error;
  }
};

// Get task statuses
export const getTaskStatuses = async (): Promise<TaskStatus[]> => {
  try {
    const response = await api.get('/tasks/statuses');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task statuses:', error);
    throw error;
  }
};

// Get task priorities
export const getPriorities = async (): Promise<TaskPriority[]> => {
  try {
    const response = await api.get('/tasks/priorities');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task priorities:', error);
    throw error;
  }
};

// Update task tags
export const updateTaskTags = async (taskId: number, tags: Tag[]): Promise<ApiResponse<void>> => {
  try {
    const response = await api.put(`tasks/${taskId}/tags`, { tags });
    return response.data;
  } catch (error) {
    console.error('Error updating task tags:', error);
    throw error;
  }
};
