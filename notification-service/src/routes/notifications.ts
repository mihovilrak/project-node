import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateNotification } from '../middleware/validation';
import { notificationService } from '../services/notificationService';
import { 
  NotificationWithType, 
  NotificationCreateRequest
} from '../types/notification-routes.types';

const router = Router();

router.get('/:userId', async (
  req: Request<{ userId: string }>, 
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query<NotificationWithType>(
      `SELECT * FROM user_notifications($1)`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      id: '', 
      type_id: 0, 
      user_id: '', 
      created_on: new Date(), 
      error: errorMessage 
    });
  }
});

router.post('/', rateLimiter, validateNotification, async (
  req: Request<{}, {}, NotificationCreateRequest>,
  res: Response
): Promise<void> => {
  try {
    const { type, userId, data } = req.body;
    const notification = await notificationService.generateNotification(type, userId, data);
    res.status(201).json(notification);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      id: '', 
      type_id: 0, 
      user_id: '', 
      created_on: new Date(), 
      error: errorMessage 
    });
  }
});

export { router as notificationRoutes };
