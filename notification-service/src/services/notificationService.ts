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

class NotificationService {
  async processNewNotifications(): Promise<void> {
    try {
      const query = `SELECT * FROM v_notification_service`;
      
      const result = await pool.query<DatabaseNotification>(query);
      
      for (const notification of result.rows) {
        await this.sendNotificationEmail(notification);
        metrics.increment('notificationsSent');
      }
    } catch (error) {
      logger.error('Failed to process notifications:', error);
      metrics.increment('notificationErrors');
    }
  }

  async sendNotificationEmail(notification: DatabaseNotification): Promise<void> {
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
      await pool.query(
        `UPDATE notifications 
        SET read_on = NOW() 
        WHERE id = $1`,
        [notification.id]
      );
    } catch (error) {
      logger.error('Failed to send notification email:', error);
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
      logger.error('Failed to generate notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
