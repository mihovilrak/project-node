export interface Admin {
  id: string;
  user_id: string;
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
  user_id: string;
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
  id: string;
  user_id: string;
  user_login: string;
  activity_type_id: string;
  activity_name: string;
  description: string;
  created_on: Date;
}

export interface Permission {
  id: string;
  name: string;
}

export interface SystemLogQuery {
  startDate?: string;
  endDate?: string;
  type?: string;
}
