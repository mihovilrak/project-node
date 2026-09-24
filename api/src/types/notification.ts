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
 * Extend notification records with type-specific display properties for rendering.
 *
 * Includes type_name, type_icon, and type_color alongside base notification fields to support complete UI presentation without additional lookups.
 */
export interface NotificationWithDetails extends Notification {
  type_name: string;
  type_icon: string;
  type_color: string;
}

/**
 * Enumerate notification categories that correspond to database type identifiers.
 *
 * Maps numeric type IDs to notification events such as task assignments, updates, comments, completions, project changes, and membership additions.
 */
export enum NotificationType {
  TaskDueSoon = 1,
  TaskAssigned = 2,
  TaskUpdated = 3,
  TaskComment = 4,
  TaskCompleted = 5,
  ProjectUpdate = 6,
  TaskCreated = 7,
  ProjectMemberAdded = 8,
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
  type_id: number;
}
