// Main Notification interface matching database schema and API responses
export interface Notification {
  id: number;
  user_id: number;
  type_id: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_on: string;  // ISO datetime string
  // Virtual fields from database views/joins
  type_name?: string;
  type_color?: string;
  type_icon?: string;
}

export interface NotificationType {
  id: number;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
}

// Notification creation payload
export interface NotificationCreate {
  user_id: number;
  type_id: number;
  title: string;
  message: string;
  link?: string;
}

// Notification update payload
export interface NotificationUpdate {
  id: number;
  is_read: boolean;
}

// Notification filter parameters
export interface NotificationFilters {
  type_id?: number;
  is_read?: boolean;
  from_date?: string;
  to_date?: string;
}

// Notification count response
export interface NotificationCount {
  total: number;
  unread: number;
}

// Notification preferences (part of user settings)
export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  task_reminders: boolean;
  project_updates: boolean;
  mentions: boolean;
}

// WebSocket notification payload
export interface WebSocketNotification {
  type: 'notification';
  data: Notification;
} 

export interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}
