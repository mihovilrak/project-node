import { User } from './user';
import { Role } from './role';

export interface ActivityType {
  id: number;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  active: boolean;
}

export interface TaskType {
  id: number;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  active: boolean;
}

export interface Permission {
  id: number;
  name: string;
}

export interface ActivityTypeDialogProps {
  open: boolean;
  activityType?: ActivityType;
  onClose: () => void;
  onSave: (activityType: Partial<ActivityType>) => Promise<void>;
}

export interface TaskTypeDialogProps {
  open: boolean;
  taskType?: TaskType;
  onClose: () => void;
  onSave: (taskType: Partial<TaskType>) => Promise<void>;
}

export interface ActivityTypesTableProps {
  activityTypes: ActivityType[];
  onEdit: (activityType: ActivityType) => void;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

export interface TaskTypesTableProps {
  taskTypes: TaskType[];
  onEdit: (taskType: TaskType) => void;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

export interface SystemSettingsState {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface TypesAndRolesState {
  activeTab: number;
  taskTypes: TaskType[];
  activityTypes: ActivityType[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  dialogOpen: boolean;
  selectedItem: TaskType | ActivityType | Role | null;
}

export interface AppSettings {
  id: number;
  app_name: string;
  company_name: string;
  sender_email: string;
  time_zone: string;
  theme: 'light' | 'dark' | 'system';
  welcome_message: string;
  created_on?: string;
  updated_on?: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface TaskTypeSelectProps {
  value: number | string;
  onChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  error?: boolean;
  required?: boolean;
}

export interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onUserDeleted: () => void;
}

export interface IconSelectorProps {
  value: string | undefined;
  onChange: (icon: string) => void;
}

export interface UserSettings {
  user_id: number;
  timezone: string | null;
  language: string | null;
  date_format: string | null;
  time_format: string | null;
  notification_preferences: {
    email_notifications: boolean;
    push_notifications: boolean;
    task_reminders: boolean;
    project_updates: boolean;
    team_mentions: boolean;
  };
  created_on: string;
  updated_on: string | null;
}

export interface ActivityTypeFormData {
  name: string;
  color: string;
  description: string;
  active: boolean;
  icon: string | undefined;
}

export interface ActivityTypeFormProps {
  formData: ActivityTypeFormData;
  onChange: (field: string, value: string | boolean) => void;
}

interface AdminRole extends Role {
}

export interface TypesAndRolesDialogProps {
  activeTab: number;
  dialogOpen: boolean;
  selectedItem: TaskType | ActivityType | AdminRole | null;
  onClose: () => void;
  onSave: (item: Partial<TaskType | ActivityType | AdminRole>) => Promise<void>;
}
