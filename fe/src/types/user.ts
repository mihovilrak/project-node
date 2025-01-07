export interface User {
  id: number;
  login: string;
  password?: string;
  name: string;
  surname: string;
  email: string;
  role_id: number;
  status_id: number;
  timezone: string | null;
  language: string | null;
  avatar_url: string | null;
  created_on: string;
  updated_on: string | null;
  last_login: string | null;
  role?: string;
  status?: string;
  status_color?: string;
  full_name?: string;
  permissions?: string[];
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  project_updates: boolean;
  team_mentions: boolean;
}

export interface UserSettings {
  user_id: number;
  timezone: string | null;
  language: string | null;
  date_format: string | null;
  time_format: string | null;
  notification_preferences: NotificationPreferences;
  created_on: string;
  updated_on: string | null;
}

export interface UserCreate {
  login: string;
  password: string;
  name: string;
  surname: string;
  email: string;
  role_id: number;
  status_id?: number;
  timezone?: string;
  language?: string;
}

export interface UserUpdate {
  id: number;
  login?: string;
  password?: string;
  currentPassword?: string;
  name?: string;
  surname?: string;
  email?: string;
  role_id?: number;
  status_id?: number;
  timezone?: string;
  language?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileUpdate {
  name?: string;
  surname?: string;
  email?: string;
  timezone?: string;
  language?: string;
} 

export interface FormData {
  login: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  currentPassword?: string;
  confirmPassword?: string;
  role_id: number;
  status_id?: number;  
}

export interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onUserSaved: (user: User) => void;
}

export interface UserDetailsState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface UserFormProps {
  userId?: string;
}
