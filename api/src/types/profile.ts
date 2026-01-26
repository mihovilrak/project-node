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

export interface ProfileUpdateInput {
  name?: string;
  surname?: string;
  email?: string;
  login?: string;
}

export interface PasswordUpdateInput {
  old_password: string;
  new_password: string;
}

export interface ProfileStats {
  total_tasks: number;
  total_time_logged: number;
  tasks_completed: number;
  tasks_in_progress: number;
}
