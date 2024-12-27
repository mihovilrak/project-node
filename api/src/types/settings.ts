export interface Settings {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  created_on: Date;
  updated_on: Date;
}

export interface SettingsUpdateInput {
  theme?: string;
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
