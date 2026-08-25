import { Router } from 'express';
import { Pool } from 'pg';
import * as notificationController from '../controllers/notificationController';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.get('/:user_id', withPool(pool, notificationController.getUserNotifications));
  router.patch('/:user_id', withPool(pool, notificationController.markAsRead));
  router.delete('/:id', withPool(pool, notificationController.deleteNotification));

  return router;
};
