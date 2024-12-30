export interface NotificationData {
  [key: string]: any;
}

export interface NotificationRequest {
  type: string;
  userId: string;
  data: NotificationData;
}

export interface NotificationResponse {
  error?: string;
}
