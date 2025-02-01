export interface Profile {
  id: number;
  name: string;
  surname: string;
  email: string;
  login: string;
  created_on: Date;
  updated_on: Date;
  active: boolean;
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
