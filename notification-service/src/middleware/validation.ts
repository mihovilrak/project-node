import { Request, Response, NextFunction } from 'express';
import { NotificationCreateRequest } from '../types/notification-routes.types';

const VALID_NOTIFICATION_TYPES = [
  'Task Due Soon', 'Task Assigned', 'Task Updated', 'Task Comment',
  'Task Completed', 'Project Update'
] as const;

const errorResponse = (message: string) => ({
  id: '',
  type_id: 0,
  user_id: '',
  created_on: new Date(),
  error: message
});

export const validateNotification = (
  req: Request<{}, {}, NotificationCreateRequest>,
  res: Response,
  next: NextFunction
): Promise<void> | void => {
  const { type, userId, data } = req.body;
  if (!type || !userId || !data) {
    res.status(400).json(errorResponse('Invalid notification data'));
    return;
  }
  const typeStr = String(type).trim();
  if (!VALID_NOTIFICATION_TYPES.includes(typeStr as typeof VALID_NOTIFICATION_TYPES[number])) {
    res.status(400).json(errorResponse('Invalid notification type'));
    return;
  }
  const userIdNum = parseInt(String(userId), 10);
  if (Number.isNaN(userIdNum) || userIdNum <= 0) {
    res.status(400).json(errorResponse('Invalid user id'));
    return;
  }
  next();
};
