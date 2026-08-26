// Shape returned by get_notifications_for_service(): the claimed row plus the
// recipient's address.
export interface DatabaseNotification {
  id: string;
  user_id: string;
  type_id: number;
  title: string;
  message: string;
  link: string;
  data: Record<string, unknown> | null;
  email_attempts: number;
  created_on: Date;
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
