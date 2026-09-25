import { api } from './api';
import { Tag } from '../types/tag';

/**
 * Fetch tags from the API. Only active tags are returned unless
 * `includeInactive` is set (honoured for admins only).
 *
 * @param signal Optional AbortSignal to cancel the request.
 * @param includeInactive Also return deleted (inactive) tags.
 */
export const getTags = async (
  signal?: AbortSignal,
  includeInactive = false,
): Promise<Tag[]> => {
  const response = await api.get<Tag[]>('/tags', {
    ...(includeInactive ? { params: { include_inactive: true } } : {}),
    signal,
  });
  return response.data;
};

export type TagInput = Partial<Pick<Tag, 'name' | 'color' | 'icon' | 'active'>>;

/**
 * Create a tag (admin only). Name and a #RRGGBB colour are required.
 *
 * @param tag Tag fields to create.
 */
export const createTag = async (tag: TagInput): Promise<Tag> => {
  const response = await api.post<Tag>('/tags', tag);
  return response.data;
};

/**
 * Update the given fields of a tag (admin only). `{ active: true }` reactivates
 * a deleted tag.
 *
 * @param id Tag ID.
 * @param tag Fields to change.
 */
export const updateTag = async (id: number, tag: TagInput): Promise<Tag> => {
  const response = await api.put<Tag>(`/tags/${id}`, tag);
  return response.data;
};

/**
 * Soft-delete a tag (admin only). It is hidden from pickers and task tag lists
 * until reactivated.
 *
 * @param id Tag ID.
 */
export const deleteTag = async (id: number): Promise<void> => {
  await api.delete(`/tags/${id}`);
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

/**
 * Add tags to a task and return the task's resulting tags.
 *
 * @param taskId Numeric ID of the task.
 * @param tagIds IDs of the tags to add.
 */
export const addTaskTags = async (
  taskId: number,
  tagIds: number[],
): Promise<Tag[]> => {
  const response = await api.post<Tag[]>(`/tasks/${taskId}/tags`, {
    tagIds: tagIds.map(Number),
  });
  return response.data;
};

/**
 * Remove a single tag from a task.
 *
 * @param taskId Numeric ID of the task.
 * @param tagId ID of the tag to remove.
 */
export const removeTaskTag = async (
  taskId: number,
  tagId: number,
): Promise<void> => {
  await api.delete(`/tasks/${taskId}/tags/${tagId}`);
};
