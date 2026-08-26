import { PoolClient } from 'pg';
import { pool } from '../db';
import { logger } from '../utils/logger';
import { emailService } from './emailService';
import { metrics } from '../metrics';
import {
  DatabaseNotification,
  NotificationTemplateType,
  NotificationEmailData,
} from '../types/notification-service.types';
import { NotificationCreateResponse } from '../types/notification-routes.types';

const BATCH_LIMIT = 100;
const SEND_CONCURRENCY = 5;
// After this many failed attempts a notification is dead-lettered: the claim
// function stops handing it out and the failure is logged and counted.
const MAX_EMAIL_ATTEMPTS = 5;

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
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
    try {
      // Claiming is one committed statement on purpose: the previous version
      // held FOR UPDATE row locks across every SMTP round-trip, and a failed
      // COMMIT re-sent the whole batch on the next tick.
      const result = await pool.query<DatabaseNotification>(
        'SELECT * FROM get_notifications_for_service($1, $2)',
        [BATCH_LIMIT, MAX_EMAIL_ATTEMPTS],
      );

      await runWithConcurrency(
        result.rows,
        SEND_CONCURRENCY,
        async (notification) => {
          const sent = await this.sendNotificationEmail(notification);
          if (sent) {
            metrics.increment('notificationsSent');
          } else if (notification.email_attempts >= MAX_EMAIL_ATTEMPTS) {
            logger.error(
              {
                notificationId: notification.id,
                attempts: notification.email_attempts,
              },
              'Notification dead-lettered after final delivery attempt',
            );
            metrics.increment('notificationsDeadLettered');
          }
        },
      );
      metrics.setProcessingTime();
    } catch (error) {
      logger.error({ err: error }, 'Failed to process notifications');
      metrics.increment('notificationErrors');
    }
  }

  async sendNotificationEmail(
    notification: DatabaseNotification,
    client?: PoolClient,
  ): Promise<boolean> {
    const queryClient = client ?? pool;
    try {
      const emailData: NotificationEmailData = {
        userName: notification.login,
        taskUrl: notification.link,
      };

      await emailService.sendEmailWithRetry(
        notification.email,
        notification.title,
        this.getEmailTemplate(notification.type_id),
        emailData,
      );

      // emailed_on, not read_on: whether the user has read the notification is
      // theirs to say, and writing read_on here also hid the email from anyone
      // who happened to open the notification in-app first.
      await queryClient.query(
        `UPDATE notifications
        SET emailed_on = NOW()
        WHERE id = $1`,
        [notification.id],
      );
      return true;
    } catch (error) {
      logger.error(
        { err: error, notificationId: notification.id },
        'Failed to send notification email',
      );
      metrics.increment('emailErrors');
      return false;
    }
  }

  getEmailTemplate(typeId: number): NotificationTemplateType {
    switch (typeId) {
      case 1:
        return 'taskDueSoon';
      case 2:
        return 'taskAssigned';
      case 3:
        return 'taskUpdated';
      case 4:
        return 'taskComment';
      case 5:
        return 'taskCompleted';
      case 6:
        return 'projectUpdate';
      default:
        return 'default';
    }
  }

  async generateNotification(
    type: string,
    userId: string,
    data: Record<string, any>,
  ): Promise<NotificationCreateResponse> {
    try {
      const result = await pool.query<NotificationCreateResponse>(
        `INSERT INTO notifications (type_id, user_id, data, created_on)
         VALUES ((SELECT id FROM notification_types WHERE name = $1), $2, $3, NOW())
         RETURNING id, type_id, user_id, created_on`,
        [type, userId, data],
      );

      return result.rows[0];
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate notification');
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
