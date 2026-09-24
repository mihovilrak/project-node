import { Pool } from 'pg';
import { Queryable } from '../utils/transaction';
import {
  Notification,
  NotificationWithDetails,
  NotificationCreateInput,
  CreateWatcherNotificationsInput,
} from '../types/notification';
import {
  Pagination,
  defaultPagination,
  paginationClause,
} from '../utils/pagination';

/**
 * Retrieve paginated notifications for a user, excluding soft-deleted entries and including notification type metadata.
 *
 * The query joins notification type details (name, icon, color) for client rendering and excludes dismissed notifications via the user_notifications() database function. Results are ordered by creation date descending, then by id descending.
 * @param pool database connection pool
 * @param user_id identifier of the user whose notifications to retrieve
 * @param pagination limit and offset for result pagination; defaults to the standard pagination configuration
 */
export const getNotificationsByUserId = async (
  pool: Pool,
  user_id: string,
  pagination: Pagination = defaultPagination(),
): Promise<NotificationWithDetails[]> => {
  // user_notifications() applies the soft-delete predicate and joins the type
  // name/icon/colour the client renders; querying the table directly returned
  // notifications the user had already dismissed.
  const page = paginationClause(pagination, 2);
  const result = await pool.query(
    `SELECT * FROM user_notifications($1)
     ORDER BY created_on DESC, id DESC
     ${page.clause}`,
    [user_id, ...page.values],
  );
  return result.rows;
};

/**
 * Mark all unread active notifications for a user as read with a timestamp.
 *
 * Updates only notifications that are currently unread and active, setting is_read to true and read_on to the current timestamp. Returns the updated notification records.
 * @param pool Database connection pool
 * @param user_id User identifier
 * @returns Array of updated notification records
 */
export const markNotificationsAsRead = async (
  pool: Pool,
  user_id: string,
): Promise<Notification[]> => {
  const result = await pool.query(
    `UPDATE notifications
    SET (is_read, read_on) = (true, current_timestamp)
    WHERE user_id = $1
    AND is_read = false
    AND active = true
    RETURNING *`,
    [user_id],
  );
  return result.rows;
};

/**
 * Mark a single notification as read with the current timestamp.
 * @param pool database connection pool
 * @param id notification identifier
 * @param user_id user identifier
 * @returns Promise<Notification[]>
 */
export const markNotificationAsRead = async (
  pool: Pool,
  id: string,
  user_id: string,
): Promise<Notification[]> => {
  const result = await pool.query(
    `UPDATE notifications
    SET (is_read, read_on) = (true, current_timestamp)
    WHERE id = $1
    AND user_id = $2
    AND is_read = false
    AND active = true
    RETURNING *`,
    [id, user_id],
  );
  return result.rows;
};

/**
 * Remove a notification, returning false if it does not exist or belongs to another user.
 *
 * This operation is scoped to the notification owner. The deletion is performed by marking the notification as inactive. Returns false when the notification ID does not exist or when the user_id does not match the notification owner.
 * @param pool Database connection pool
 * @param id Notification ID to delete
 * @param user_id ID of the user attempting deletion; used to verify ownership
 * @returns true if the notification was successfully deleted, false if not found or not owned by the user
 */
export const deleteNotification = async (
  pool: Pool,
  id: string,
  user_id: string,
): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE notifications
    SET active = false
    WHERE id = $1
    AND user_id = $2
    RETURNING id`,
    [id, user_id],
  );
  return (result.rowCount ?? 0) > 0;
};

/**
 * Generate notifications for all users watching a task when an action occurs.
 *
 * Invokes the create_watcher_notifications database function to instantiate notification records. Used when tasks are created, updated, or commented upon to alert watchers of activity.
 * @param pool Database connection or transaction
 * @param root1 Task identifier, user performing the action, and notification type
 */
export const createWatcherNotifications = async (
  pool: Queryable,
  { task_id, action_user_id, type_id }: CreateWatcherNotificationsInput,
): Promise<Notification[]> => {
  const result = await pool.query(
    `SELECT * FROM create_watcher_notifications($1, $2, $3)`,
    [task_id, action_user_id, type_id],
  );
  return result.rows;
};

/**
 * Generate and persist notifications for all members of a project following a user action.
 * @param pool Database connection or transaction context.
 * @param root1 Project identifier, user who triggered the action, and notification type identifier.
 */
export const createProjectMemberNotifications = async (
  pool: Queryable,
  {
    project_id,
    action_user_id,
    type_id,
  }: { project_id: number; action_user_id: number; type_id: number },
): Promise<Notification[]> => {
  const result = await pool.query(
    `SELECT * FROM create_project_member_notifications($1, $2, $3)`,
    [project_id, action_user_id, type_id],
  );
  return result.rows;
};
