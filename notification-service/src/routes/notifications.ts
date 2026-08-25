import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { logger } from '../utils/logger';
import { validateNotification } from '../middleware/validation';
import { notificationService } from '../services/notificationService';
import {
  NotificationWithType,
  NotificationCreateRequest
} from '../types/notification-routes.types';

const router = Router();

const genericErrorBody = {
  id: '',
  type_id: 0,
  user_id: '',
  created_on: new Date(),
  error: 'Internal server error'
};

function parseUserId(userId: string): number | null {
  const n = parseInt(userId, 10);
  return Number.isNaN(n) || n <= 0 ? null : n;
}

router.get('/:userId', async (
  req: Request<{ userId: string }>,
  res: Response
): Promise<void> => {
  const userId = parseUserId(req.params.userId);
  if (userId === null) {
    res.status(400).json({ ...genericErrorBody, error: 'Invalid user id' });
    return;
  }
  try {
    const result = await pool.query<NotificationWithType>(
      `SELECT * FROM user_notifications($1)`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    logger.error({ err: error }, 'GET notifications failed');
    res.status(500).json(genericErrorBody);
  }
});

router.post('/', validateNotification, async (
  req: Request<{}, {}, NotificationCreateRequest>,
  res: Response
): Promise<void> => {
  try {
    const { type, userId, data } = req.body;
    const notification = await notificationService.generateNotification(type, userId, data);
    res.status(201).json(notification);
  } catch (error: unknown) {
    logger.error({ err: error }, 'POST notification failed');
    const code = error && typeof error === 'object' && 'code' in error
      ? (error as { code: string }).code
      : '';
    if (code === '23503' || code === '23505') {
      res.status(400).json({ ...genericErrorBody, error: 'Invalid request' });
      return;
    }
    res.status(500).json(genericErrorBody);
  }
});

export { router as notificationRoutes };
