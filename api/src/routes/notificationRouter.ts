import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as notificationController from '../controllers/notificationController';

// Notification routes
export default (pool: Pool): Router => {
  const router = Router();

  // Get all notifications for a user
  router.get('/:user_id', ((req, res) => 
    notificationController.getUserNotifications(req, res, pool)) as RequestHandler);

  // Mark notifications as read
  router.patch('/:user_id', ((req, res) => 
    notificationController.markAsRead(req, res, pool)) as RequestHandler);

  // Delete notification
  router.delete('/:id', ((req, res) => 
    notificationController.deleteNotification(req, res, pool)) as RequestHandler);

  return router;
};
