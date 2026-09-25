import { Response } from 'express';
import { Pool } from 'pg';
import * as notificationModel from '../models/notificationModel';
import { CustomRequest } from '../types/express';
import { parsePagination } from '../utils/pagination';
import { parsePositiveInteger } from '../utils/requestParsing';
import { sessionUserId } from '../utils/sessionUser';

/**
 * Retrieve a page of the signed-in user's active notifications with type
 * metadata.
 *
 * @param req Express request with limit/offset in the query
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getUserNotifications = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const notifications = await notificationModel.getNotificationsByUserId(
    pool,
    sessionUserId(req),
    parsePagination(req.query),
  );
  res.status(200).json(notifications);
};

/**
 * Mark one notification (notification_id in the body) or all unread
 * notifications as read. Responds with `{ updated }`, the number of
 * notifications changed.
 *
 * @param req Express request with optional notification_id in the body
 * @param res Express response object
 * @param pool Database connection pool
 */
export const markAsRead = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const userId = sessionUserId(req);
  const { notification_id: notificationId } = (req.body ?? {}) as {
    notification_id?: unknown;
  };

  if (notificationId === undefined || notificationId === null) {
    const updated = await notificationModel.markNotificationsAsRead(
      pool,
      userId,
    );
    return res.status(200).json({ updated });
  }

  const id = parsePositiveInteger(notificationId);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid notification ID' });
  }
  const updated = await notificationModel.markNotificationAsRead(
    pool,
    String(id),
    userId,
  );
  res.status(200).json({ updated });
};

/**
 * Soft-delete a notification owned by the signed-in user; 404 if missing or not
 * theirs.
 *
 * @param req Express request with the notification id in params
 * @param res Express response object
 * @param pool Database connection pool
 */
export const deleteNotification = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const deleted = await notificationModel.deleteNotification(
    pool,
    req.params.id as string,
    sessionUserId(req),
  );
  if (!deleted) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  res.status(200).json({ message: 'Notification deleted' });
};
