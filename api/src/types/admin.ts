export interface Admin {
  id: number;
  user_id: number;
  created_on: Date;
  updated_on: Date;
  active: boolean;
}

export interface AdminWithUser extends Admin {
  user_name: string;
  user_surname: string;
  user_email: string;
  user_login: string;
}

export interface AdminCreateInput {
  user_id: number;
}

export interface AdminUpdateInput {
  active?: boolean;
}

export interface SystemStats {
  total_users: number;
  total_projects: number;
  total_tasks: number;
  total_time_logged: number;
}

export interface SystemLog {
  id: number;
  user_id: number;
  user_login: string;
  activity_type_id: number;
  activity_name: string;
  description: string;
  created_on: Date;
}

export interface Permission {
  id: number;
  name: string;
}

export interface SystemLogQuery {
  startDate?: string;
  endDate?: string;
  type?: string;
}
