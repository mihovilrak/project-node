import * as schedule from 'node-schedule';
import { pool } from '../db';
import { logger } from '../utils/logger';

/**
 * Archive notifications that are older than 30 days and already read by marking them inactive and setting archived_on so they remain distinguishable from notifications a user deleted (which also set active = false).
 *
 * Runs a database UPDATE that sets active = false and archived_on = NOW() for notifications where active is true, created_on is more than 30 days ago, and the notification has been read (read_on IS NOT NULL or is_read = true). Logs the number of rows affected on success and logs an error on failure. The archived_on timestamp is intentionally used to mark "aged out" notifications so they can be distinguished from notifications where active = false was set by a user delete.
 */
export const cleanupOldNotifications = async (): Promise<void> => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET active = false,
           archived_on = NOW()
       WHERE active
       AND created_on < NOW() - INTERVAL '30 days'
       AND (read_on IS NOT NULL OR is_read = true)`,
    );
    logger.info({ rowCount: result.rowCount }, 'Cleaned up old notifications');
  } catch (error) {
    logger.error({ err: error }, 'Error cleaning up notifications');
  }
};

export const scheduleCleanup = (): schedule.Job =>
  schedule.scheduleJob('0 2 * * *', cleanupOldNotifications);
