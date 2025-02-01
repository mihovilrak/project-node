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

// Extended notification type with joined data
export interface NotificationWithDetails extends Notification {
  type_name: string;
  type_icon: string;
  type_color: string;
}

// Notification type IDs matching the database
export enum NotificationType {
  TaskDueSoon = 1,
  TaskAssigned = 2,
  TaskUpdated = 3,
  TaskComment = 4,
  TaskCompleted = 5,
  ProjectUpdate = 6,
  TaskCreated = 7,
  ProjectMemberAdded = 8
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
