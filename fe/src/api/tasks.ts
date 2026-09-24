import { api } from './api';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskFilters,
  TaskFormState,
} from '../types/task';
import { Tag } from '../types/tag';
import { ApiResponse } from '../types/api';

const serializeTaskFilters = (filters: TaskFilters): string => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  return queryParams.toString();
};

/**
 * Get all tasks optionally filtered by the provided TaskFilters and return them as an array of Task objects.
 *
 * Performs an HTTP GET to /tasks; the supplied filters (default {}) are serialized into query parameters and appended to the request path (if serialization yields an empty string the request is sent to /tasks). The optional AbortSignal can be used to cancel the in-flight request. The function returns the response payload (response.data) — an array of Task.
 * @param filters Optional TaskFilters used to restrict the returned tasks. Defaults to an empty object. Filters are serialized into the request query string.
 * @param signal Optional AbortSignal to cancel the request. If provided and aborted, the fetch is cancelled.
 */
export const getTasks = async (
  filters: TaskFilters = {},
  signal?: AbortSignal,
): Promise<Task[]> => {
  const queryParams = serializeTaskFilters(filters);
  const response = await api.get<Task[]>(
    `/tasks${queryParams ? `?${queryParams}` : ''}`,
    { signal },
  );
  return response.data;
};

/**
 * Retrieve the task with the given numeric id from the backend API and return it as a Task object.
 *
 * Performs an HTTP GET to /tasks/:id and returns the server's Task payload. Accepts an optional AbortSignal to cancel the request; the returned promise will reject on network errors or if the request is aborted. No local side effects beyond performing the network request.
 * @param id Numeric id of the task to fetch (required).
 * @param signal Optional AbortSignal to cancel the HTTP request.
 */
export const getTaskById = async (
  id: number,
  signal?: AbortSignal,
): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${id}`, { signal });
  return response.data;
};

/**
 * Create a new task on the server by POSTing the provided partial task data to /tasks and return the created Task including any server-assigned fields.
 *
 * Sends a POST request to the API endpoint '/tasks' with the supplied partial Task object. The server is expected to assign server-side fields (for example id, created_on, created_by, and any default values); the resolved value is the Task returned in response.data. This helper does not perform client-side validation of taskData and will propagate network or API errors from the request.
 * @param taskData Partial<Task> containing the fields to set on the new task; server may ignore or populate additional fields.
 */
export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  const response = await api.post<Task>('/tasks', taskData);
  return response.data;
};

/**
 * Send modified task fields to the server to update an existing task.
 *
 * Performs an HTTP PUT to /tasks/:id with a Partial<TaskFormState>; the server validates the payload and returns an ApiResponse wrapping the updated Task. Only the fields present in data will be sent/updated; omitted fields are left unchanged by the client request. taskId must be the numeric ID of an existing task.
 * @param taskId Numeric ID of the task to update.
 * @param data Partial<TaskFormState> containing one or more fields to change (e.g., name, description, project_id, status_id, start_date, due_date, tags).
 * @returns Promise resolving to ApiResponse<Task> with the updated task in its data property.
 */
export const updateTask = async (
  taskId: number,
  data: Partial<TaskFormState>,
): Promise<ApiResponse<Task>> => {
  const response = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, data);
  return response.data;
};

/**
 * Send a DELETE request to remove the task with the given ID from the server.
 *
 * Performs an HTTP DELETE to /tasks/{id}; no value is returned—promise resolves when the server confirms deletion. Callers should update local UI/state (for example, refetch task lists or navigate away) because this method does not modify client-side caches. The promise will reject on network or server errors.
 * @param id Numeric ID of the task to delete.
 */
export const deleteTask = async (id: number): Promise<void> => {
  await api.delete<void>(`/tasks/${id}`);
};

/**
 * Retrieve the tasks for a given project, applying optional task filters and allowing the request to be aborted.
 *
 * Builds a GET request to /projects/{projectId}/tasks, appending serialized filter query parameters when filters are provided. The function returns the array of Task objects (possibly empty) from the API response. An AbortSignal can be passed to cancel the underlying request. Filters are serialized using the module's serializeTaskFilters helper; if the serialization yields an empty string no query string is added.
 * @param projectId numeric project identifier used in the request URL (required)
 * @param filters optional TaskFilters object (defaults to {}) that will be serialized into query parameters to narrow the returned tasks
 * @param signal optional AbortSignal to cancel the HTTP request
 */
export const getProjectTasks = async (
  projectId: number,
  filters: TaskFilters = {},
  signal?: AbortSignal,
): Promise<Task[]> => {
  const queryParams = serializeTaskFilters(filters);
  const url = `/projects/${projectId}/tasks${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get<Task[]>(url, { signal });
  return response.data;
};

/**
 * Fetch the subtasks belonging to a given parent task ID and return them as an array of Task objects, supporting cancellation via an optional AbortSignal.
 *
 * Performs an HTTP GET to /tasks/{parentTaskId}/subtasks and returns the response data (the list of subtasks). If provided, the AbortSignal will cancel the underlying request.
 * @param parentTaskId number — ID of the parent task whose subtasks should be fetched
 * @param signal AbortSignal | undefined — optional signal to cancel the HTTP request
 */
export const getSubtasks = async (
  parentTaskId: number,
  signal?: AbortSignal,
): Promise<Task[]> => {
  const response = await api.get<Task[]>(`/tasks/${parentTaskId}/subtasks`, {
    signal,
  });
  return response.data;
};

/**
 * Fetch tasks within a given start–end date range by calling the server calendar endpoint with ISO-formatted query parameters.
 *
 * Sends a GET request to '/tasks/calendar' with start_date and end_date set to startDate.toISOString() and endDate.toISOString(); the request can be aborted via the optional AbortSignal. The function returns the server response's data (an array of Task). Note: calling toISOString() on an invalid Date will throw synchronously.
 * @param startDate Start of the date range as a Date object; converted to an ISO string and sent as the start_date query parameter.
 * @param endDate End of the date range as a Date object; converted to an ISO string and sent as the end_date query parameter.
 * @param signal Optional AbortSignal to cancel the underlying HTTP request.
 */
export const getTasksByDateRange = async (
  startDate: Date,
  endDate: Date,
  signal?: AbortSignal,
): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks/calendar', {
    params: {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    },
    signal,
  });
  return response.data;
};

/**
 * Patch a task's start_date and/or due_date on the server and return the updated Task.
 *
 * Sends a PATCH request to /tasks/{taskId}/dates with an object that may include start_date and/or due_date. Each date should be a date-only string (typically YYYY-MM-DD); omitted fields are left unchanged server-side. The call resolves to the updated Task resource (which contains start_date and due_date fields that may be null). The function performs no client-side validation, so callers commonly convert Date values to date-only strings before calling.
 * @param taskId The numeric ID of the task to update.
 * @param dates An object with optional date-only strings: { start_date?: string; due_date?: string } (use YYYY-MM-DD format).
 */
export const updateTaskDates = async (
  taskId: number,
  dates: { start_date?: string; due_date?: string },
): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${taskId}/dates`, dates);
  return response.data;
};

/**
 * Fetch active tasks from the backend API and return them as an array of Task objects.
 *
 * Performs an HTTP GET to '/tasks/active' and returns response.data (Task[]). Accepts an optional AbortSignal to cancel the request; the function does not modify server state.
 * @param signal Optional AbortSignal to cancel the request; if aborted, the underlying request may be terminated.
 */
export const getActiveTasks = async (signal?: AbortSignal): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks/active', { signal });
  return response.data;
};

/**
 * Update a task's status on the server and return the updated Task object.
 *
 * Sends a PATCH request to /tasks/{taskId}/change-status with { statusId } in the body; this performs a persistent server-side change and resolves to the updated Task (with updated status_id, status_name, etc.). Both taskId and statusId must be valid numeric identifiers.
 * @param taskId Numeric ID of the task to update.
 * @param statusId Numeric ID of the status to apply to the task.
 */
export const changeTaskStatus = async (
  taskId: number,
  statusId: number,
): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${taskId}/change-status`, {
    statusId,
  });
  return response.data;
};

/**
 * Fetch the list of task statuses from the API.
 *
 * Sends a GET request to '/tasks/statuses' and returns the server-provided array of TaskStatus objects. The request respects the optional AbortSignal so callers can cancel it. Each TaskStatus contains: id, name, color, description (nullable), active, created_on, and updated_on (nullable). The promise will reject on network or HTTP errors.
 * @param signal Optional AbortSignal to cancel the HTTP request.
 */
export const getTaskStatuses = async (
  signal?: AbortSignal,
): Promise<TaskStatus[]> => {
  const response = await api.get<TaskStatus[]>('/tasks/statuses', { signal });
  return response.data;
};

/**
 * Retrieve the list of available task priorities from the API.
 *
 * Performs an HTTP GET to '/tasks/priorities' and resolves with the array of TaskPriority objects returned in response.data. Accepts an optional AbortSignal to cancel the request.
 * @param signal Optional AbortSignal to cancel the network request.
 */
export const getPriorities = async (
  signal?: AbortSignal,
): Promise<TaskPriority[]> => {
  const response = await api.get<TaskPriority[]>('/tasks/priorities', {
    signal,
  });
  return response.data;
};

// Update task tags
export const updateTaskTags = async (
  taskId: number,
  tags: Tag[],
): Promise<ApiResponse<void>> => {
  const response = await api.put<ApiResponse<void>>(`/tasks/${taskId}/tags`, {
    tags,
  });
  return response.data;
};
