import { User } from './user';
import { Role } from './role';
import { Permission } from './admin';
import { TaskType } from './task';
import { Tag } from './tag';

export type { Permission } from './admin';
export type { TaskType } from './task';

/**
 * Represent an activity classification used by the application, including
 * display properties (name, color, optional icon and description), active
 * state, and optional audit timestamps.
 */
export interface ActivityType {
  id: number;
  name: string;
  color: string;
  icon?: string | null;
  description?: string | null;
  active: boolean;
  created_on?: string;
  updated_on?: string | null;
}

/**
 * Provide properties for a dialog component used to create or edit an activity
 * type, including open state, the item being edited, and callbacks for close
 * and save.
 */
export interface ActivityTypeDialogProps {
  open: boolean;
  activityType?: ActivityType;
  onClose: () => void;
  onSave: (activityType: Partial<ActivityType>) => Promise<void>;
}

/**
 * Provide properties for a dialog component used to create or edit a task type.
 */
export interface TaskTypeDialogProps {
  open: boolean;
  taskType?: TaskType;
  onClose: () => void;
  onSave: (taskType: Partial<TaskType>) => Promise<void>;
}

/**
 * Provide the properties required by a table component that lists activity
 * types and supports editing, deletion, and optional loading and management
 * controls.
 */
export interface ActivityTypesTableProps {
  activityTypes: ActivityType[];
  onEdit: (activityType: ActivityType) => void;
  onDelete: (id: number) => Promise<void>;
  onReactivate?: (activityType: ActivityType) => void;
  loading?: boolean;
  canManage?: boolean;
}

export interface TaskTypesTableProps {
  taskTypes: TaskType[];
  onEdit: (taskType: TaskType) => void;
  onDelete: (id: number) => Promise<void>;
  onReactivate?: (taskType: TaskType) => void;
  loading?: boolean;
  canManage?: boolean;
}

export interface TagsTableProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (id: number) => Promise<void>;
  onReactivate: (tag: Tag) => void;
  loading?: boolean;
  canManage?: boolean;
}

export interface TagDialogProps {
  open: boolean;
  tag?: Tag;
  onClose: () => void;
  onSave: (tag: Partial<Tag>) => Promise<void>;
}

/**
 * Represent the UI state for managing application-wide settings, including the
 * current settings payload, loading/error flags, and whether the most recent
 * save succeeded.
 */
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
  tags: Tag[];
  showInactive: boolean;
  loading: boolean;
  error: string | null;
  dialogOpen: boolean;
  selectedItem: TypesAndRolesItem | null;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Represent the application's global configuration values and metadata used
 * across the system.
 */
export interface AppSettings {
  id: number;
  app_name: string;
  company_name: string;
  sender_email: string;
  time_zone: string;
  theme: 'light' | 'dark' | 'system';
  welcome_message: string;
  app_base_url: string;
  log_level: LogLevel;
  email_enabled: boolean;
  email_host: string;
  email_port: number;
  email_secure: boolean;
  created_on?: string;
  updated_on?: string;
}

/**
 * Provide a timezone option for selection UIs with canonical identifiers, UTC
 * offset in seconds, DST indicator, and a display label.
 */
export interface TimezoneOption {
  name: string;
  region: string;
  abbrev: string;
  utcOffsetSeconds: number;
  isDst: boolean;
  label: string;
}

/**
 * Provide props for a users list component: an array of User items, a callback
 * to edit a user, and a callback invoked when a user is deleted.
 */
export interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onUserDeleted: () => void;
  onUserUpdated?: () => void;
  currentUserId?: number;
}

export interface IconSelectorProps {
  value: string | undefined;
  onChange: (icon: string) => void;
}

/**
 * Define the fields required by a form to create or edit an activity type.
 */
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

type AdminRole = Role;

export type TypesAndRolesItem = TaskType | ActivityType | AdminRole | Tag;

/**
 * Specify the properties required by a dialog used to create or edit task
 * types, activity types, or admin roles, including which tab is active, whether
 * the dialog is open, the currently selected item, and callbacks to close or
 * save.
 */
export interface TypesAndRolesDialogProps {
  activeTab: number;
  dialogOpen: boolean;
  selectedItem: TypesAndRolesItem | null;
  onClose: () => void;
  onSave: (item: Partial<TypesAndRolesItem>) => Promise<void>;
}
