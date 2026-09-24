import { User } from './user';
import { Task } from './task';
import { Project } from './project';

export interface ProfileData extends User {
  total_tasks: number;
  completed_tasks: number;
  active_projects: number;
  total_hours: number;
}

/**
 * Provide aggregate numeric statistics summarizing a user's profile activity.
 */
export interface ProfileStats {
  totalTasks: number;
  completedTasks: number;
  activeProjects: number;
  totalHours: number;
}

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

export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileProjectListProps {
  projects: Project[];
  loading?: boolean;
}

export interface ProfileHeaderProps {
  user: User;
}

export interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
  profile: ProfileData;
  onProfileUpdate: (data: ProfileFormData) => Promise<void>;
}

export interface ProfileFormData {
  name: string;
  surname: string;
  email: string;
}

export type ProfileUpdateData = Pick<User, 'name' | 'surname' | 'email'>;

/**
 * Specify the props for a profile task list component: an array of Task objects, an optional loading flag, and a handler invoked with a task's id when a task is clicked.
 */
export interface ProfileTaskListProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick: (taskId: number) => void;
}

export interface PasswordChangeDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Represent the state of a password-change form, including the current password, the proposed new password, a confirmation field, and an optional error message.
 */
export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  error?: string;
}
