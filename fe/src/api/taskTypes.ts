import { api } from './api';
import { TaskType } from '../types/task';

/**
 * Fetch all task types from the server.
 *
 * Performs an HTTP GET to '/admin/task-types' and returns the response data as an array of TaskType; accepts an optional AbortSignal to cancel the network request.
 * @param signal Optional AbortSignal used to cancel the HTTP request.
 */
export const getTaskTypes = async (
  signal?: AbortSignal,
): Promise<TaskType[]> => {
  const response = await api.get<TaskType[]>('/admin/task-types', { signal });
  return response.data;
};

// Get task type by id
export const getTaskTypeById = async (id: number): Promise<TaskType> => {
  const response = await api.get<TaskType>(`/admin/task-types/${id}`);
  return response.data;
};

/**
 * Create a new task type on the server using the provided TaskType fields.
 *
 * Sends a POST request to /admin/task-types with the supplied partial TaskType as the request body. The server is expected to return the created TaskType (typically including assigned id and created_on/updated_on timestamps); the function resolves with response.data.
 * @param taskTypeData Partial<TaskType> containing fields for the new task type; optional fields (description, icon, active, etc.) may be omitted. This object is sent as the POST body.
 * @returns Promise resolving to the created TaskType as returned by the API.
 */
export const createTaskType = async (
  taskTypeData: Partial<TaskType>,
): Promise<TaskType> => {
  const response = await api.post<TaskType>('/admin/task-types', taskTypeData);
  return response.data;
};

/**
 * Update an existing task type on the server by sending partial TaskType data for the task type identified by the given id.
 *
 * Sends an HTTP PUT to /admin/task-types/{id} with the provided partial TaskType payload and returns the updated TaskType as returned by the server. taskTypeData may omit fields (only provided fields are applied). The returned Promise rejects on network or server errors (for example if the id does not exist or validation fails).
 * @param id Numeric id of the task type to update.
 * @param taskTypeData Partial TaskType containing the fields to change; omitted fields will not be modified.
 */
export const updateTaskType = async (
  id: number,
  taskTypeData: Partial<TaskType>,
): Promise<TaskType> => {
  const response = await api.put<TaskType>(
    `/admin/task-types/${id}`,
    taskTypeData,
  );
  return response.data;
};

/**
 * Delete the server-side task type identified by the given numeric id.
 *
 * Performs an HTTP DELETE request against /admin/task-types/{id} to remove the task type resource on the server. The promise resolves once the remote deletion completes and does not return a value. The id must refer to an existing task type.
 * @param id Numeric identifier of the task type to delete. Must correspond to an existing task type on the server.
 */
export const deleteTaskType = async (id: number): Promise<void> => {
  await api.delete<void>(`/admin/task-types/${id}`);
};

/**
 * Fetch the list of available icon identifiers from the server.
 *
 * Performs an HTTP GET to '/admin/task-types/icons' and resolves to the array of icon names (string identifiers) returned by the server. The optional AbortSignal can be used to cancel the in-flight network request. This function has no local side effects or caching; the returned list reflects the server response and the promise will reject for network or server errors.
 * @param signal Optional AbortSignal to cancel the request.
 */
export const getAvailableIcons = async (
  signal?: AbortSignal,
): Promise<string[]> => {
  const response = await api.get<string[]>('/admin/task-types/icons', {
    signal,
  });
  return response.data;
};
