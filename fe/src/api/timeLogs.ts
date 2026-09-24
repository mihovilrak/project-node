import { api } from './api';
import { TimeLog, TimeLogCreate, TimeSpent } from '../types/timeLog';

/**
 * Retrieve all time logs; requires administrative privileges.
 */
export const getAllTimeLogs = async (): Promise<TimeLog[]> => {
  const response = await api.get<TimeLog[]>('/time-logs');
  return response.data;
};

/**
 * Fetch time log entries for a specific task from the backend API.
 *
 * Performs an HTTP GET to /time-logs/tasks/{taskId}/logs and returns the response body as an array of TimeLog objects. Accepts an optional AbortSignal to cancel the request. taskId must be the numeric identifier of the task.
 * @param taskId number — numeric ID of the task whose time logs should be fetched.
 * @param signal AbortSignal | undefined — optional signal to cancel the in-flight HTTP request.
 */
export const getTaskTimeLogs = async (
  taskId: number,
  signal?: AbortSignal,
): Promise<TimeLog[]> => {
  const response = await api.get<TimeLog[]>(`/time-logs/tasks/${taskId}/logs`, {
    signal,
  });
  return response.data;
};

/**
 * Fetch the total time recorded for a task from the API.
 *
 * Resolves to an object of shape { spent_time: number } where spent_time is the total time recorded for the task (in seconds). Performs an HTTP GET to /time-logs/tasks/{taskId}/spent-time.
 * @param taskId Numeric ID of the task to retrieve spent time for.
 */
export const getTaskSpentTime = async (taskId: number): Promise<TimeSpent> => {
  const response = await api.get<TimeSpent>(
    `/time-logs/tasks/${taskId}/spent-time`,
  );
  return response.data;
};

/**
 * Fetch the time logs for a specific project from the API.
 *
 * Performs an HTTP GET to /time-logs/projects/{projectId}/logs and returns the server's list of TimeLog objects for that project. The provided params object is forwarded as query parameters to the request (use it for filters, pagination, date ranges, etc.). The optional AbortSignal can be used to cancel the in-flight request. The returned promise resolves to an array (possibly empty) of TimeLog records and will reject on network or server errors.
 * @param projectId Numeric ID of the project to fetch time logs for.
 * @param params Optional plain object whose properties are sent as query parameters (filters, pagination, date range, etc.).
 * @param signal Optional AbortSignal to cancel the HTTP request.
 */
export const getProjectTimeLogs = async (
  projectId: number,
  params?: Record<string, any>,
  signal?: AbortSignal,
): Promise<TimeLog[]> => {
  const response = await api.get<TimeLog[]>(
    `/time-logs/projects/${projectId}/logs`,
    { params, signal },
  );
  return response.data;
};

/**
 * Retrieve the total spent time for a project by its ID.
 *
 * Sends a GET request to /time-logs/projects/{projectId}/spent-time and resolves with an object of shape { spent_time: number } representing the project's total spent time (unit as returned by the API).
 * @param projectId number — ID of the project to fetch spent time for.
 */
export const getProjectSpentTime = async (
  projectId: number,
): Promise<TimeSpent> => {
  const response = await api.get<TimeSpent>(
    `/time-logs/projects/${projectId}/spent-time`,
  );
  return response.data;
};

/**
 * Create a time log entry for a specific task by posting the provided TimeLogCreate fields to the API.
 *
 * Performs an HTTP POST to /time-logs/tasks/{taskId}/logs with a payload containing log_date, spent_time, description, and activity_type_id. If description is omitted it is sent as an empty string. The taskId path parameter is used to associate the new log with the task (the task_id field on the TimeLogCreate is not used by this call).
 * @param taskId Task ID (number) identifying the task to attach the new time log to; used in the request URL.
 * @param timeLog Object matching TimeLogCreate: must include log_date (string), spent_time (number), and activity_type_id (number); description is optional and will be sent as an empty string if omitted. Note: task_id inside this object is ignored by the request (taskId parameter is used instead).
 */
export const createTimeLog = async (
  taskId: number,
  timeLog: TimeLogCreate,
): Promise<TimeLog> => {
  const response = await api.post<TimeLog>(`/time-logs/tasks/${taskId}/logs`, {
    log_date: timeLog.log_date,
    spent_time: timeLog.spent_time,
    description: timeLog.description ?? '',
    activity_type_id: timeLog.activity_type_id,
  });
  return response.data;
};

/**
 * Retrieve the authenticated user's time logs from the API.
 *
 * Performs an HTTP GET to '/time-logs/user/logs', passing the optional params as query parameters and accepting an AbortSignal to cancel the request. Resolves with an array of TimeLog objects representing the user's time logs.
 * @param params Optional record of query parameters to filter or paginate the user's time logs; these are sent as the request's query string.
 * @param signal Optional AbortSignal used to cancel the in-flight HTTP request.
 */
export const getUserTimeLogs = async (
  params?: Record<string, any>,
  signal?: AbortSignal,
): Promise<TimeLog[]> => {
  const response = await api.get<TimeLog[]>('/time-logs/user/logs', {
    params,
    signal,
  });
  return response.data;
};

/**
 * Update an existing time log on the server with new date, spent time, description and activity type.
 *
 * Sends an HTTP PUT to /time-logs/:id and returns the server's updated TimeLog. Only the fields log_date, spent_time, description and activity_type_id from the provided TimeLogCreate are sent in the request body — task_id and user_id (if present) are not forwarded. The operation updates the server record (which may change updated_on) and resolves with the complete TimeLog returned by the API.
 * @param timeLogId Numeric ID of the time log to update.
 * @param timeLog Partial time log data (TimeLogCreate) containing at least log_date, spent_time and activity_type_id; description is optional. task_id and user_id, if present, are ignored by this call.
 */
export const updateTimeLog = async (
  timeLogId: number,
  timeLog: TimeLogCreate,
): Promise<TimeLog> => {
  const response = await api.put<TimeLog>(`/time-logs/${timeLogId}`, {
    log_date: timeLog.log_date,
    spent_time: timeLog.spent_time,
    description: timeLog.description,
    activity_type_id: timeLog.activity_type_id,
  });
  return response.data;
};

/**
 * Delete the specified time log on the server by its numeric ID.
 *
 * Performs an HTTP DELETE to /time-logs/{timeLogId} and resolves when the server acknowledges deletion. No payload is returned; callers should re-fetch time logs if they need the updated state.
 * @param timeLogId Numeric ID of the time log to delete.
 */
export const deleteTimeLog = async (timeLogId: number): Promise<void> => {
  await api.delete<void>(`/time-logs/${timeLogId}`);
};
