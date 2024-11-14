const pool = require('../db');
const logger = require('../utils/logger');
const emailService = require('./emailService');
const metrics = require('../metrics');
const config = require('../config');

class NotificationService {
  async processNewNotifications() {
    try {
      const query = `
        SELECT n.*, u.email, u.login 
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        WHERE n.created_on > NOW() - INTERVAL '5 minutes'
        AND n.active = true
        AND NOT EXISTS (
          SELECT 1 FROM notifications n2
          WHERE n2.id = n.id
          AND n2.read_on IS NOT NULL
        )
        FOR UPDATE SKIP LOCKED`;
      
      const result = await pool.query(query);
      
      for (const notification of result.rows) {
        await this.sendNotificationEmail(notification);
        metrics.increment('notificationsSent');
      }
    } catch (error) {
      logger.error('Failed to process notifications:', error);
      metrics.increment('notificationErrors');
    }
  }

  async sendNotificationEmail(notification) {
    try {
      await emailService.sendEmailWithRetry(
        notification.email,
        notification.title,
        this.getEmailTemplate(notification.type_id),
        {
          userName: notification.login,
          taskUrl: notification.link
        }
      );

      // Mark as read after sending email
      await pool.query(
        'UPDATE notifications SET read_on = NOW() WHERE id = $1',
        [notification.id]
      );
    } catch (error) {
      logger.error('Failed to send notification email:', error);
      metrics.increment('emailErrors');
    }
  }

  getEmailTemplate(typeId) {
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
}

module.exports = new NotificationService();