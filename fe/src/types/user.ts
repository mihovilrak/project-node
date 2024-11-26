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
  role_name?: string;
  status_name?: string;
  status_color?: string;
  full_name?: string;
  permissions?: string[];
}

export interface UserStatus {
  id: number;
  name: string;
  color: string;
  description: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
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

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  project_updates: boolean;
  team_mentions: boolean;
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

export interface UserUpdate extends Partial<Omit<UserCreate, 'password'>> {
  id: number;
  password?: string;
}

export interface UserFilters {
  role_id?: number;
  status_id?: number;
  search?: string;
}

export interface UserStats {
  total_tasks: number;
  completed_tasks: number;
  active_projects: number;
  total_time_logged: number;
  recent_activities: UserActivity[];
}

export interface UserActivity {
  id: number;
  type: 'task' | 'comment' | 'project' | 'time_log';
  action: string;
  entity_id: number;
  created_on: string;
  entity_name?: string;
  project_name?: string;
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
  role_id: number;
}

export interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onUserSaved: (user: User) => void;
}