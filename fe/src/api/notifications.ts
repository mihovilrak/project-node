import { api } from './api';
import { Notification } from '../types/notification';

/**
 * Fetch the current authenticated user's notifications from the server; the server resolves the owner from the session so do not provide a user id.
 *
 * Performs a GET /notifications request and returns the array of Notification objects for the authenticated session user. The server determines the owner from the session (no user id is sent). If an AbortSignal is provided it is forwarded to the HTTP client to allow cancelling the request.
 * @param signal Optional AbortSignal to cancel the request; passed through to the underlying HTTP client.
 */
export const getNotifications = async (
  signal?: AbortSignal,
): Promise<Notification[]> => {
  const response = await api.get<Notification[]>('/notifications', { signal });
  return response.data;
};

/**
 * Mark a single notification as read when a notificationId is provided, or mark all notifications as read when called without an id.
 *
 * Sends a PATCH request to '/notifications' with { notification_id: notificationId } when a notificationId is given, or an empty body to mark all notifications as read. This performs a server-side state change; callers typically refresh the notification list after the promise resolves.
 * @param notificationId Optional numeric id of the notification to mark as read; omit to mark all notifications as read.
 */
export const markAsRead = async (notificationId?: number): Promise<void> => {
  await api.patch<void>(
    '/notifications',
    notificationId ? { notification_id: notificationId } : {},
  );
};

/**
 * Delete the specified notification on the server via the notifications API.
 *
 * Sends an HTTP DELETE request to /notifications/{notificationId} to remove the notification server-side. Requires a valid numeric notificationId; callers typically re-fetch the notification list after this call to update UI state.
 * @param notificationId The numeric ID of the notification to delete.
 */
export const deleteNotification = async (
  notificationId: number,
): Promise<void> => {
  await api.delete<void>(`/notifications/${notificationId}`);
};
