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
  theme: string;
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
