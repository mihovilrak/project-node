export interface Settings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  welcome_message: string;
  created_on: Date;
  updated_on: Date;
}

export interface SettingsUpdateInput {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  welcome_message?: string;
}

export interface UserSettings extends Settings {
  user_name: string;
  user_surname: string;
  user_email: string;
  user_login: string;
}
