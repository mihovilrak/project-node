import { Response } from 'express';
import { Pool } from 'pg';
import * as notificationModel from '../models/notificationModel';
import { CustomRequest } from '../types/express';
import logger from '../utils/logger';
import { parsePagination } from '../utils/pagination';

/**
 * Retrieve paginated notifications for the authenticated user.
 *
 * Requires active session authentication. Returns notifications excluding soft-deleted entries with type metadata. Applies pagination constraints to query parameters.
 * @param req Express request with user session data
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getUserNotifications = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const notifications = await notificationModel.getNotificationsByUserId(
      pool,
      String(userId),
      parsePagination(req.query),
    );
    res.status(200).json(notifications);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Mark the current user's notifications as read, either a specific notification by ID or all unread notifications.
 *
 * Requires authentication; returns HTTP 401 if user session is absent. Marks a single notification as read when notification_id is provided in the request body, or marks all unread active notifications as read when notification_id is omitted. Returns the updated notifications with HTTP 200 on success, or HTTP 500 on server error.
 * @param req HTTP request with authenticated user session and optional notification_id in body
 * @param res HTTP response object
 * @param pool database connection pool
 */
export const markAsRead = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const { notification_id: notificationId } = (req.body ?? {}) as {
      notification_id?: number | string;
    };
    const updatedNotifications =
      notificationId === undefined || notificationId === null
        ? await notificationModel.markNotificationsAsRead(pool, String(userId))
        : await notificationModel.markNotificationAsRead(
            pool,
            String(notificationId),
            String(userId),
          );
    res.status(200).json(updatedNotifications);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove a notification resource owned by the authenticated user.
 *
 * Requires valid user session authentication. Returns 404 if the notification does not exist or belongs to another user. Returns 500 on unexpected errors.
 * @param req Express request with notification id in params and authenticated user session
 * @param res Express response for sending status and JSON payload
 * @param pool Database connection pool
 */
export const deleteNotification = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { id } = req.params;
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const deleted = await notificationModel.deleteNotification(
      pool,
      id,
      String(userId),
    );
    if (!deleted) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};
