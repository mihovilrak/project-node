import api from './api';

// Get all tasks with optional filters
export const getTasks = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    const response = await api.get(`/tasks?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw error;
  }
};

// Get a single task by ID
const getTaskById = async (id) => {
  try {
    const response = await api.get(`tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

// Create a new task
const createTask = async (taskData) => {
  try {
    const response = await api.post('tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update a task
const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
const deleteTask = async (id) => {
  try {
    const response = await api.delete(`tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getTasksByProject = async (projectId) => {
  try {
    const response = await api.get(`/tasks?project_id=${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project tasks', error);
    throw error;
  }
};

export const createSubtask = async (parentTaskId, data) => {
  try {
    const response = await api.post(`/tasks/${parentTaskId}/subtasks`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to create subtask', error);
    throw error;
  }
};

export const getSubtasks = async (parentTaskId) => {
  try {
    const response = await api.get(`/tasks/${parentTaskId}/subtasks`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subtasks', error);
    throw error;
  }
};

export const getTasksByDateRange = async (startDate, endDate) => {
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

export const getProjectTasks = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project tasks', error);
    throw error;
  }
};

export const updateTaskDates = async (taskId, dates) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/dates`, dates);
    return response.data;
  } catch (error) {
    console.error('Failed to update task dates', error);
    throw error;
  }
};

export { getTasks, getTaskById, createTask, updateTask, deleteTask, getTasksByProject };