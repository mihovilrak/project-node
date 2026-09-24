export interface Profile {
  id: number;
  name: string;
  surname: string;
  email: string;
  login: string;
  role_name?: string;
  created_on: Date;
  updated_on?: Date;
  last_login?: Date;
  active?: boolean;
  total_tasks?: number;
  completed_tasks?: number;
  active_projects?: number;
  total_hours?: number;
}

/**
 * Specify optional profile fields to update for an existing user account.
 */
export interface ProfileUpdateInput {
  name?: string;
  surname?: string;
  email?: string;
  login?: string;
}

export interface PasswordUpdateInput {
  /** Current password (sent by frontend as current_password) */
  current_password?: string;
  /** Legacy field name (old_password) - accepted for compatibility */
  old_password?: string;
  new_password: string;
}

/**
 * Capture aggregate task completion and time tracking metrics for a user profile.
 */
export interface ProfileStats {
  total_tasks: number;
  total_time_logged: number;
  tasks_completed: number;
  tasks_in_progress: number;
}
