import * as schedule from 'node-schedule';
import { pool } from '../db';
import { logger } from '../utils/logger';

const cleanupOldNotifications = async (): Promise<void> => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET active = false
       WHERE created_on < NOW() - INTERVAL '30 days'
       AND (read_on IS NOT NULL OR is_read = true)`
    );
    logger.info({ rowCount: result.rowCount }, 'Cleaned up old notifications');
  } catch (error) {
    logger.error({ err: error }, 'Error cleaning up notifications');
  }
};

// Run cleanup job daily at 2 AM
schedule.scheduleJob('0 2 * * *', cleanupOldNotifications);
