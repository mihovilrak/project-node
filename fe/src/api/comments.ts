import { api } from './api';
import { Comment } from '../types/comment';

/**
 * Fetch the comments for a specific task from the backend API.
 *
 * Performs an HTTP GET to /tasks/{taskId}/comments and returns the response payload (Comment[]). The optional AbortSignal is forwarded to the underlying request so the network call can be cancelled.
 * @param taskId Numeric task identifier for which to fetch comments.
 * @param signal Optional AbortSignal to cancel the HTTP request.
 */
export const getTaskComments = async (
  taskId: number,
  signal?: AbortSignal,
): Promise<Comment[]> => {
  const response = await api.get<Comment[]>(`/tasks/${taskId}/comments`, {
    signal,
  });
  return response.data;
};

/**
 * Create a new comment for the specified task by POSTing the provided comment text to the API.
 *
 * Sends a POST request to /tasks/{taskId}/comments with body { comment: string } and returns the created Comment object from the server. Network or server errors will propagate as rejected promises.
 * @param taskId Numeric ID of the task to attach the comment to.
 * @param data Object containing the comment text, e.g. { comment: string }.
 */
export const createComment = async (
  taskId: number,
  data: { comment: string },
): Promise<Comment> => {
  const response = await api.post<Comment>(`/tasks/${taskId}/comments`, data);
  return response.data;
};

/**
 * Edit an existing task comment by sending the updated text to the backend API.
 *
 * Sends an HTTP PUT to /tasks/{taskId}/comments/{id} with a body of { comment: string } and returns the updated Comment returned by the server. Requires the numeric taskId and comment id; API/network errors are propagated to the caller. The returned Comment will reflect any server-side changes (for example updated_on).
 * @param id Numeric ID of the comment to update.
 * @param taskId Numeric ID of the task that owns the comment.
 * @param data Object with a single property 'comment' containing the new comment text.
 */
export const editComment = async (
  id: number,
  taskId: number,
  data: { comment: string },
): Promise<Comment> => {
  const response = await api.put<Comment>(
    `/tasks/${taskId}/comments/${id}`,
    data,
  );
  return response.data;
};

/**
 * Delete a comment for a given task by issuing an HTTP DELETE to the backend.
 *
 * Sends a DELETE request to the API endpoint /tasks/{taskId}/comments/{id} and resolves when the server acknowledges the deletion. Both taskId and id are numeric identifiers and must be provided by the caller; ensure the task and comment IDs are valid before calling.
 * @param taskId Numeric ID of the parent task whose comment will be deleted; required.
 * @param id Numeric ID of the comment to delete; required.
 */
export const deleteComment = async (
  taskId: number,
  id: number,
): Promise<void> => {
  await api.delete<void>(`/tasks/${taskId}/comments/${id}`);
};
