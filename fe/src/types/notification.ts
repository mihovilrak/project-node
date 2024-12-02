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

export interface NotificationCenterProps {
  userId?: number;
  open?: boolean;
  onClose?: () => void;
  className?: string;
}
