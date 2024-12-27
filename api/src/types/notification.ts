export interface Notification {
  id: string;
  user_id: string;
  task_id: string;
  action_user_id: string;
  type_id: string;
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

export interface NotificationCreateInput {
  task_id: string;
  action_user_id: string;
  type_id: string;
}

export interface NotificationType {
  id: string;
  name: string;
  description?: string;
}
