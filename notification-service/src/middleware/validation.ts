import { Request, Response, NextFunction } from 'express';
import { NotificationCreateRequest } from '../types/notification-routes.types';

export const validateNotification = (
  req: Request<{}, {}, NotificationCreateRequest>,
  res: Response,
  next: NextFunction
): Promise<void> | void => {
  const { type, userId, data } = req.body;
  if (!type || !userId || !data) {
    res.status(400).json({ 
      id: '', 
      type_id: 0, 
      user_id: '', 
      created_on: new Date(), 
      error: 'Invalid notification data' 
    });
    return;
  }
  next();
};
