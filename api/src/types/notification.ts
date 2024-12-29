export interface Notification {
  id: number;
  user_id: number;
  task_id: number;
  action_user_id: number;
  type_id: number;
  read: boolean;
  created_on: Date;
  updated_on: Date;
}

export interface NotificationWithDetails extends Notification {
  task_name: string;
  action_user_name: string;
  action_user_surname: string;
  type_name: string;
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
  description?: string;
  icon: string;
  color: string;
}

export interface NotificationCreateInput {
  task_id: number;
  action_user_id: number;
  type_id: number;
}
