export interface DatabaseNotification {
  id: string;
  user_id: string;
  type_id: number;
  title: string;
  link: string;
  created_on: Date;
  read_on: Date | null;
  active: boolean;
  email: string;
  login: string;
}

export type NotificationTemplateType =
  | 'taskDueSoon'
  | 'taskAssigned'
  | 'taskUpdated'
  | 'taskComment'
  | 'taskCompleted'
  | 'projectUpdate'
  | 'default';

export interface NotificationEmailData {
  userName: string;
  taskUrl: string;
}
