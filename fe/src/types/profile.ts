import { User } from './user';
import { Task } from './task';
import { Project } from './project';
import { TimeLog } from './timeLog';

// Main profile data interface - matches actual API response
export interface ProfileData extends User {
  total_tasks: number;
  completed_tasks: number;
  active_projects: number;
  total_hours: number;
}

// Profile statistics - matches database views and calculations
export interface ProfileStats {
  totalTasks: number;
  completedTasks: number;
  activeProjects: number;
  totalHours: number;
}

// Add these interfaces right after the existing ProfileStats interface
export interface ProfileStatsProps {
  stats: ProfileStats;
  loading: boolean;
}

export interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number | string;
  loading: boolean;
}

// System log entry - matches system_logs table
export interface SystemLogEntry {
  id: number;
  user_id: number;
  action: string;
  entity_type: 'task' | 'project' | 'comment' | 'time_log';
  entity_id: number;
  details: Record<string, any>;
  created_on: string;
  // Virtual fields from joins
  entity_name?: string;
  project_name?: string;
}

// Profile update payload - matches API endpoint
export interface ProfileUpdate {
  name?: string;
  surname?: string;
  email?: string;
  timezone?: string;
  language?: string;
}

// Password change payload - matches API endpoint
export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Profile API response - matches actual API response
export interface ProfileResponse {
  user: ProfileData;
  stats: ProfileStats;
  recent_logs: SystemLogEntry[];
  recent_tasks: Task[];
  recent_projects: Project[];
  recent_time_logs: TimeLog[];
}

// Add this interface after the existing interfaces
export interface ProfileProjectListProps {
  projects: Project[];
  loading?: boolean;
}

// Add this interface after the existing interfaces
export interface ProfileHeaderProps {
  user: User;
}

// Add these interfaces after the existing ones
export interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
  profile: ProfileData;
  onProfileUpdate: (data: FormData) => Promise<void>;
}

export interface FormData {
  name: string;
  surname: string;
  email: string;
  timezone: string | null;
  language: string | null;
}

// Add ProfileUpdateData
export interface ProfileUpdateData extends Pick<User, 'name' | 'surname' | 'email' | 'timezone' | 'language'> {}

// Update ProfileTaskListProps to match component usage
export interface ProfileTaskListProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick: (taskId: number) => void;
}

// Update ProfileProjectListProps to make progress optional
export interface ProfileProjectListProps {
  projects: Project[];
  loading?: boolean;
}

export interface PasswordChangeDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  error?: string;
}

export interface ActivityTimelineProps {
  activities: Activity[];
  loading?: boolean;
}

export interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  project?: {
    id: number;
    name: string;
  };
  task?: {
    id: number;
    name: string;
  };
}