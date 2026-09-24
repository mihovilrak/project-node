import type { PoolClient } from 'pg';
import { pool } from '../db';
import { config } from '../config';
import { reloadSettings } from '../settingsStore';
import { logger } from '../utils/logger';
import { emailService } from './emailService';
import { metrics } from '../metrics';
import {
  DatabaseNotification,
  NotificationTemplateType,
  NotificationEmailData,
} from '../types/notification-service.types';

const BATCH_LIMIT = 100;
const SEND_CONCURRENCY = 5;
// After this many failed attempts a notification is dead-lettered: the claim
// function stops handing it out and the failure is logged and counted.
const MAX_EMAIL_ATTEMPTS = 5;
// Session-level advisory lock shared by every replica of this service.
const PROCESS_LOCK_NAME = 'notification-service:process';

// Keyed by notification_types.name, which is stable across databases; the ids
// depend on insert order.
const TEMPLATES_BY_TYPE = new Map<string, NotificationTemplateType>([
  ['Task Due Soon', 'taskDueSoon'],
  ['Task Assigned', 'taskAssigned'],
  ['Task Updated', 'taskUpdated'],
  ['Task Comment', 'taskComment'],
  ['Task Completed', 'taskCompleted'],
  ['Project Update', 'projectUpdate'],
]);

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let i = 0;
  while (i < items.length) {
    const chunk = items.slice(i, i + concurrency);
    i += chunk.length;
    await Promise.all(chunk.map(fn));
  }
}

class NotificationService {
  private running = false;

  /**
   * Run one delivery pass unless another one is still in progress, either in
   * this process (a slow SMTP batch outlasting the one-minute schedule) or in
   * another replica (held via a Postgres advisory lock).
   */
  async processNewNotifications(): Promise<void> {
    if (this.running) {
      logger.warn('Previous notification run still in progress; skipping');
      return;
    }
    this.running = true;

    let client: PoolClient | null = null;
    let locked = false;
    try {
      client = await pool.connect();
      const lock = await client.query<{ locked: boolean }>(
        'SELECT pg_try_advisory_lock(hashtext($1)) AS locked',
        [PROCESS_LOCK_NAME],
      );
      locked = lock.rows[0]?.locked === true;
      if (!locked) {
        logger.info('Another instance is processing notifications; skipping');
        return;
      }
      await this.processBatch();
    } catch (error) {
      logger.error({ err: error }, 'Failed to process notifications');
      metrics.increment('notificationErrors');
    } finally {
      await this.releaseLock(client, locked);
      this.running = false;
    }
  }

  /**
   * Claim pending notifications, deliver their emails concurrently, and mark
   * each one emailed as soon as its send succeeds.
   */
  private async processBatch(): Promise<void> {
    // SMTP settings are editable from the admin UI while the service runs.
    if (await reloadSettings()) {
      emailService.refreshTransport();
    }

    // Claiming increments email_attempts, so with email disabled it would
    // burn attempts and eventually dead-letter rows that were never tried.
    if (!config.app.emailEnabled) {
      return;
    }

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
          // Marked per row so a crash mid-batch does not re-send the rows
          // that already went out.
          await this.markEmailed(notification.id);
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
  }

  private async releaseLock(
    client: PoolClient | null,
    locked: boolean,
  ): Promise<void> {
    if (!client) return;
    if (!locked) {
      client.release();
      return;
    }
    try {
      await client.query('SELECT pg_advisory_unlock(hashtext($1))', [
        PROCESS_LOCK_NAME,
      ]);
      client.release();
    } catch (error) {
      logger.error({ err: error }, 'Failed to release notification lock');
      // Destroy the connection so the session-level lock dies with it instead
      // of staying held by an idle pooled client.
      client.release(error as Error);
    }
  }

  /**
   * Mark a notification as emailed.
   *
   * Updates emailed_on instead of read_on because whether a user has read a
   * notification is for the user to determine, and writing read_on during email
   * processing would hide emails for users who opened the notification in-app
   * first.
   *
   * @param id The notification ID to mark as emailed.
   */
  async markEmailed(id: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE notifications SET emailed_on = NOW() WHERE id = $1',
        [id],
      );
    } catch (error) {
      logger.error(
        { err: error, notificationId: id },
        'Failed to mark notification emailed',
      );
      metrics.increment('notificationErrors');
    }
  }

  /**
   * Send a templated email for the provided database notification and return
   * whether sending succeeded.
   *
   * @param notification The DatabaseNotification row to send; used fields
   *   include id, email, login, link, title, message, type_name, and data
   *   (merged into the template context).
   */
  async sendNotificationEmail(
    notification: DatabaseNotification,
  ): Promise<boolean> {
    try {
      const emailData: NotificationEmailData = {
        // The row's `data` jsonb carries the per-type fields the templates
        // reference; the named fields below always win over it.
        ...(notification.data ?? {}),
        userName: notification.login,
        // Links are relative app paths, which an email client has no origin to
        // resolve against.
        taskUrl: notification.link
          ? `${config.appBaseUrl}${notification.link}`
          : config.appBaseUrl,
        title: notification.title,
        message: notification.message,
        typeName: notification.type_name,
      };

      await emailService.sendEmailWithRetry(
        notification.email,
        notification.title,
        this.getEmailTemplate(notification.type_name),
        emailData,
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

  /**
   * Map a notification type name to its email template.
   *
   * @param typeName The notification_types.name of the notification.
   * @returns The template name, or 'default' for types without their own
   *   template.
   */
  getEmailTemplate(typeName: string): NotificationTemplateType {
    return TEMPLATES_BY_TYPE.get(typeName) ?? 'default';
  }
}

export const notificationService = new NotificationService();
