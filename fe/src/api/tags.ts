import { api } from './api';
import { Tag } from '../types/tag';

/**
 * Fetch all tags from the API, optionally cancelling the request via an
 * AbortSignal.
 *
 * Performs an HTTP GET to /tags and returns the server-provided array of Tag
 * objects. The function does not apply any client-side filtering (for example,
 * it does not restrict to active tags); callers should filter the returned list
 * if they need a subset. If provided, the AbortSignal can be used to cancel the
 * underlying request.
 *
 * @param signal Optional AbortSignal to cancel the request.
 */
export const getTags = async (signal?: AbortSignal): Promise<Tag[]> => {
  const response = await api.get<Tag[]>('/tags', { signal });
  return response.data;
};

/**
 * Fetch the tags assigned to the task identified by taskId.
 *
 * Performs an HTTP GET to /tasks/{taskId}/tags and returns the response payload
 * as an array of Tag objects. The request is read-only and has no side effects.
 * An optional AbortSignal can be passed to cancel the request; if aborted the
 * returned promise may reject with an AbortError. The promise will also reject
 * on network failures or non-2xx HTTP responses (for example, 404 if the task
 * does not exist).
 *
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
