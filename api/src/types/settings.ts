export interface Settings {
  id: string;
  user_id: string;
  app_name: string;
  company_name: string;
  sender_email: string;
  time_zone: string;
  theme: 'light' | 'dark' | 'system';
  welcome_message: string;
  created_on: Date;
  updated_on: Date;
}

export interface SettingsUpdateInput {
  app_name?: string;
  company_name?: string;
  sender_email?: string;
  time_zone?: string;
  theme?: 'light' | 'dark' | 'system';
  welcome_message?: string;
}

export interface UserSettingsUpdateInput {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
}

export interface UserSettings extends Settings {
  user_name: string;
  user_surname: string;
  user_email: string;
  user_login: string;
}
