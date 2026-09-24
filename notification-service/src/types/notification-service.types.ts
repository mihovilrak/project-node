/**
 * Represent the notification row returned by get_notifications_for_service, including the original database fields plus the recipient's email and login.
 *
 * This shape is the database row for a notification augmented with the recipient address information (email and login). Field invariants and notes: 'data' may be null or an arbitrary record; 'email_attempts' counts how many times delivery to the recipient was attempted; 'created_on' is a Date object; 'type_id' is a numeric identifier and 'type_name' a human-readable name; 'email' and 'login' are the recipient's contact identifiers returned alongside the claimed row.
 */
export interface DatabaseNotification {
  id: string;
  user_id: string;
  type_id: number;
  type_name: string;
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

/**
 * Provide the base string properties passed into notification email templates; additional per-type fields from the notification's data JSONB column are spread in alongside these properties.
 *
 * Required properties (all strings): userName — recipient display name; taskUrl — URL to the task or related resource; title — short subject or title for the email; message — body text or excerpt; typeName — human-readable notification type. The interface extends Record<string, unknown>, so implementations may include extra keys and templates may also read per-type fields (for example taskName, projectName, priority) which are merged in from the notification's data JSONB column.
 */
export interface NotificationEmailData extends Record<string, unknown> {
  userName: string;
  taskUrl: string;
  title: string;
  message: string;
  typeName: string;
}
