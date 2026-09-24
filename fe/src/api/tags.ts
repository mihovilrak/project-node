import { api } from './api';
import { Tag } from '../types/tag';

/**
 * Fetch all tags from the API, optionally cancelling the request via an AbortSignal.
 *
 * Performs an HTTP GET to /tags and returns the server-provided array of Tag objects. The function does not apply any client-side filtering (for example, it does not restrict to active tags); callers should filter the returned list if they need a subset. If provided, the AbortSignal can be used to cancel the underlying request.
 * @param signal Optional AbortSignal to cancel the request.
 */
export const getTags = async (signal?: AbortSignal): Promise<Tag[]> => {
  const response = await api.get<Tag[]>('/tags', { signal });
  return response.data;
};

/**
 * Create a new tag on the server using the provided partial tag data.
 *
 * Sends a POST request to /tags with the supplied tagData. The server returns the fully populated Tag (including id, created_on, created_by, and other server-assigned fields); any fields omitted from tagData may be filled or validated by the server. tagData is a Partial<Tag>, so only provided fields are sent—required fields and validation rules are enforced server-side.
 * @param tagData Partial<Tag> containing fields to set on the new tag (for example name, color, icon, description, active). Omitted fields may be assigned by the server.
 */
export const createTag = async (tagData: Partial<Tag>): Promise<Tag> => {
  const response = await api.post<Tag>('/tags', tagData);
  return response.data;
};

// Add tags to task
export const addTaskTags = async (
  taskId: number,
  tagIds: number[],
): Promise<Tag[]> => {
  const response = await api.post<Tag[]>(`/tasks/${taskId}/tags`, { tagIds });
  return response.data;
};

// Remove tag from task
export const removeTaskTag = async (
  taskId: number,
  tagId: number,
): Promise<void> => {
  await api.delete<void>(`/tasks/${taskId}/tags/${tagId}`);
};

/**
 * Fetch the tags assigned to the task identified by taskId.
 *
 * Performs an HTTP GET to /tasks/{taskId}/tags and returns the response payload as an array of Tag objects. The request is read-only and has no side effects. An optional AbortSignal can be passed to cancel the request; if aborted the returned promise may reject with an AbortError. The promise will also reject on network failures or non-2xx HTTP responses (for example, 404 if the task does not exist).
 * @param taskId Numeric ID of the task whose tags should be fetched.
 * @param signal Optional AbortSignal to cancel the in-flight request.
 */
export const getTaskTags = async (
  taskId: number,
  signal?: AbortSignal,
): Promise<Tag[]> => {
  const response = await api.get<Tag[]>(`/tasks/${taskId}/tags`, { signal });
  return response.data;
};
