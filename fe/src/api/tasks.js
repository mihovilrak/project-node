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
export const getTaskById = async (id) => {
  try {
    const response = await api.get(`tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await api.post('tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update a task
export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getProjectTasks = async (projectId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/projects/${projectId}/tasks${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project tasks:', error);
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

export const updateTaskDates = async (taskId, dates) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/dates`, dates);
    return response.data;
  } catch (error) {
    console.error('Failed to update task dates', error);
    throw error;
  }
};

export const getActiveTasks = async () => {
  try {
    const response = await api.get('/tasks/active');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch active tasks:', error);
    throw error;
  }
};

export const changeTaskStatus = async (taskId, statusId) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/status`, { statusId });
    return response.data;
  } catch (error) {
    console.error('Failed to change task status:', error);
    throw error;
  }
};

// Get all task statuses
export const getTaskStatuses = async () => {
  try {
    const response = await api.get('/tasks/statuses');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task statuses:', error);
    throw error;
  }
};

// Get all task priorities
export const getPriorities = async () => {
  try {
    const response = await api.get('/tasks/priorities');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch task priorities:', error);
    throw error;
  }
};

// Get tasks by assignee
export const getTasksByAssignee = async (assigneeId) => {
  try {
    const response = await api.get(`/tasks?assignee=${assigneeId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tasks by assignee:', error);
    throw error;
  }
};

// Get tasks by holder
export const getTasksByHolder = async (holderId) => {
  try {
    const response = await api.get(`/tasks?holder=${holderId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tasks by holder:', error);
    throw error;
  }
};