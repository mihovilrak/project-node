import { DatabaseNotification } from './notification-service.types';

export interface NotificationType {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface NotificationWithType extends DatabaseNotification {
  type: string;
  icon: string;
  color: string;
}

export interface NotificationCreateRequest {
  type: string;
  userId: string;
  data: {
    [key: string]: any;
  };
}

export interface NotificationCreateResponse {
  id: string;
  type_id: number;
  user_id: string;
  created_on: Date;
  [key: string]: any;
}
