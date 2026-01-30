import { PoolClient } from 'pg';
import { pool } from '../db';
import { logger } from '../utils/logger';
import { emailService } from './emailService';
import { metrics } from '../metrics';
import {
  DatabaseNotification,
  NotificationTemplateType,
  NotificationEmailData
} from '../types/notification-service.types';
import { NotificationCreateResponse } from '../types/notification-routes.types';

const BATCH_LIMIT = 100;
const SEND_CONCURRENCY = 5;

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let i = 0;
  while (i < items.length) {
    const chunk = items.slice(i, i + concurrency);
    i += chunk.length;
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

class NotificationService {
  async processNewNotifications(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query<DatabaseNotification>(
        'SELECT * FROM get_notifications_for_service($1)',
        [BATCH_LIMIT]
      );

      await runWithConcurrency(
        result.rows,
        SEND_CONCURRENCY,
        async (notification) => {
          await this.sendNotificationEmail(notification, client);
          metrics.increment('notificationsSent');
        }
      );
      await client.query('COMMIT');
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback errors
      }
      logger.error({ err: error }, 'Failed to process notifications');
      metrics.increment('notificationErrors');
    } finally {
      client.release();
    }
  }

  async sendNotificationEmail(notification: DatabaseNotification, client?: PoolClient): Promise<void> {
    const queryClient = client ?? pool;
    try {
      const emailData: NotificationEmailData = {
        userName: notification.login,
        taskUrl: notification.link
      };

      await emailService.sendEmailWithRetry(
        notification.email,
        notification.title,
        this.getEmailTemplate(notification.type_id),
        emailData
      );

      // Mark as read after sending email
      await queryClient.query(
        `UPDATE notifications
        SET read_on = NOW()
        WHERE id = $1`,
        [notification.id]
      );
    } catch (error) {
      logger.error({ err: error }, 'Failed to send notification email');
      metrics.increment('emailErrors');
    }
  }

  getEmailTemplate(typeId: number): NotificationTemplateType {
    switch(typeId) {
      case 1: return 'taskDueSoon';
      case 2: return 'taskAssigned';
      case 3: return 'taskUpdated';
      case 4: return 'taskComment';
      case 5: return 'taskCompleted';
      case 6: return 'projectUpdate';
      default: return 'default';
    }
  }

  async generateNotification(
    type: string,
    userId: string,
    data: Record<string, any>
  ): Promise<NotificationCreateResponse> {
    try {
      const result = await pool.query<NotificationCreateResponse>(
        `INSERT INTO notifications (type_id, user_id, data, created_on)
         VALUES ((SELECT id FROM notification_types WHERE name = $1), $2, $3, NOW())
         RETURNING id, type_id, user_id, created_on`,
        [type, userId, data]
      );

      return result.rows[0];
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate notification');
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
