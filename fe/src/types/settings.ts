import { User } from './user';

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

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  active?: boolean;
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

export interface RoleDialogProps {
  open: boolean;
  role?: Role;
  onClose: () => void;
  onSave: (role: Partial<Role>) => Promise<void>;
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

export interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete?: (id: number) => Promise<void>;
  loading?: boolean;
}

export interface SystemSettingsState {
  settings: SystemSettings;
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

export interface SystemSettings {
  company_name: string;
  email: string;
  timezone: string;
  language: string;
  date_format: string;
  time_format: string;
  currency: string;
  logo_url?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  project_updates: boolean;
  team_mentions: boolean;
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

export interface SystemSettingsFormData {
  company_name: string;
  email: string;
  timezone: string;
  language: string;
  date_format: string;
  time_format: string;
  currency: string;
  logo_url?: string;
}

export interface TaskTypeFormData {
  name: string;
  color: string;
  description: string;
  active: boolean;
  icon?: string;
}

export interface TaskTypeSelectProps {
  value: number | string;
  onChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  error?: boolean;
  required?: boolean;
}

export interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

export interface IconSelectorProps {
  value?: string;
  onChange: (icon: string) => void;
}

export interface AppSettings {
  id: number;
  company_name: string;
  company_email: string | null;
  default_timezone: string;
  default_language: string;
  date_format: string;
  time_format: string;
  currency: string;
  logo_url: string | null;
  created_on: string;
  updated_on: string | null;
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

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  project_updates: boolean;
  team_mentions: boolean;
}

export interface SystemOptions {
  timezones: string[];
  languages: LanguageOption[];
  dateFormats: string[];
  timeFormats: string[];
  currencies: CurrencyOption[];
}

interface LanguageOption {
  code: string;
  name: string;
  native_name: string;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface AppSettingsUpdate extends Partial<Omit<AppSettings, 'id' | 'created_on' | 'updated_on'>> {}

export interface UserSettingsUpdate extends Partial<Omit<UserSettings, 'user_id' | 'created_on' | 'updated_on'>> {}

export interface LogoUploadResponse {
  logo_url: string;
}

export interface SettingsValidationError {
  field: string;
  message: string;
}

export interface SettingsResponse {
  app: AppSettings;
  user: UserSettings | null;
  options: SystemOptions;
} 