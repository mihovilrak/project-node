import { api } from './api';
import { TaskWatcher } from '../types/watcher';

/**
 * Get the watchers for a task from the backend API and return them as TaskWatcher objects.
 *
 * Performs an HTTP GET to /tasks/{taskId}/watchers and resolves to an array of TaskWatcher objects (fields: task_id, user_id, user_name, optional role). Accepts an optional AbortSignal to cancel the in-flight request; if the signal is aborted the underlying request will be cancelled and the returned Promise may reject. The Promise also rejects on network or HTTP errors.
 * @param taskId Numeric task identifier used in the request path (required).
 * @param signal Optional AbortSignal to cancel the request; if aborted the request will be cancelled and the Promise may reject.
 */
export const getTaskWatchers = async (
  taskId: number,
  signal?: AbortSignal,
): Promise<TaskWatcher[]> => {
  const response = await api.get<TaskWatcher[]>(`/tasks/${taskId}/watchers`, {
    signal,
  });
  return response.data;
};

// Add task watcher
export const addTaskWatcher = async (
  taskId: number,
  userId: number,
): Promise<TaskWatcher> => {
  const response = await api.post<TaskWatcher>(`/tasks/${taskId}/watchers`, {
    userId,
  });
  return response.data;
};

/**
 * Remove the specified user from a task's watchers by issuing an HTTP DELETE to the server endpoint for that task and user.
 *
 * Performs an HTTP DELETE request to /tasks/{taskId}/watchers/{userId}; on success the user is removed as a watcher on the server. Callers must supply valid numeric taskId and userId (calling code should ensure userId is present) and handle network or server errors as needed.
 * @param taskId Numeric ID of the task whose watcher should be removed.
 * @param userId Numeric ID of the user to remove from the task's watchers.
 */
export const removeTaskWatcher = async (
  taskId: number,
  userId: number,
): Promise<void> => {
  await api.delete<void>(`/tasks/${taskId}/watchers/${userId}`);
};
