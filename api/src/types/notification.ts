export interface Notification {
  id: number;
  user_id: number;
  type_id: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  active: boolean;
  read_on: Date | null;
  created_on: Date;
}

/**
 * Extend notification records with type-specific display properties for
 * rendering.
 *
 * Includes type_name, type_icon, and type_color alongside base notification
 * fields to support complete UI presentation without additional lookups.
 */
export interface NotificationWithDetails extends Notification {
  type_name: string;
  type_icon: string;
  type_color: string;
}

/**
 * Values are notification_types.name, so ids never have to match the seed
 * order.
 */
export enum NotificationType {
  TaskDueSoon = 'Task Due Soon',
  TaskAssigned = 'Task Assigned',
  TaskUpdated = 'Task Updated',
  TaskComment = 'Task Comment',
  TaskCompleted = 'Task Completed',
  ProjectUpdate = 'Project Update',
  TaskCreated = 'Task Created',
  ProjectMemberAdded = 'Added to Project',
}

export interface NotificationTypeInfo {
  id: number;
  name: string;
  icon: string;
  color: string;
  created_on: Date;
}

export interface NotificationCreateInput {
  user_id: number;
  type_id: number;
  title: string;
  message: string;
  link?: string | null;
}

export interface CreateWatcherNotificationsInput {
  task_id: number;
  action_user_id: number;
  type: NotificationType;
}
