import { Pool } from 'pg';
import { Notification, NotificationWithDetails, NotificationCreateInput } from '../types/notification';

// Get notifications by user ID
export const getNotificationsByUserId = async (
  pool: Pool,
  user_id: string
): Promise<NotificationWithDetails[]> => {
  const result = await pool.query(
    `SELECT * FROM notifications 
    WHERE user_id = $1 
    ORDER BY created_on DESC`,
    [user_id]
  );
  return result.rows;
};

// Mark notifications as read
export const markNotificationsAsRead = async (
  pool: Pool,
  user_id: string
): Promise<Notification[]> => {
  const result = await pool.query(
    `UPDATE notifications 
    SET (is_read, read_on) = (true, current_timestamp) 
    WHERE user_id = $1 
    AND is_read = false 
    RETURNING *`,
    [user_id]
  );
  return result.rows;
};

// Delete notification
export const deleteNotification = async (
  pool: Pool,
  id: string
): Promise<void> => {
  await pool.query(
    `UPDATE notifications 
    SET active = false
    WHERE id = $1`,
    [id]
  );
};

// Create watcher notifications
export const createWatcherNotifications = async (
  pool: Pool,
  { task_id, action_user_id, type_id }: NotificationCreateInput
): Promise<Notification[]> => {
  const result = await pool.query(
    `SELECT * FROM create_watcher_notifications($1, $2, $3)`,
    [task_id, action_user_id, type_id]
  );
  return result.rows;
};

// Create project member notifications
export const createProjectMemberNotifications = async (
  pool: Pool,
  { project_id, action_user_id, type_id }: { project_id: number; action_user_id: number; type_id: number }
): Promise<Notification[]> => {
  const result = await pool.query(
    `SELECT * FROM create_project_member_notifications($1, $2, $3)`,
    [project_id, action_user_id, type_id]
  );
  return result.rows;
};
