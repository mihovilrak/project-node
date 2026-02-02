export interface User {
  id: number;
  login: string;
  name: string;
  surname: string;
  email: string;
  status_id: number;
  role_id: number;
  created_on: Date;
  updated_on: Date | null;
}

export interface UserDetails extends User {
  status: string;
  role: string;
  last_login: Date | null;
}

export interface UserCreateInput {
  login: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  role_id: number;
  status_id?: number;
}

export interface UserUpdateInput {
  login?: string;
  name?: string;
  surname?: string;
  email?: string;
  password?: string;
  role_id?: number;
  status_id?: number;
}

export interface UserQueryFilters {
  whereParams: {
    [key: string]: string;
  };
  includeDeleted?: boolean;
}

export interface UserStatus {
  id: number;
  name: string;
}

export interface UserRole {
  id: number;
  name: string;
}

export interface UserPermission {
  user_id: number;
  permission: string;
  granted_on: Date;
}

export interface UserSession {
  id: number;
  user_id: number;
  expires: Date;
  data: {
    user: User;
  };
  user: User;
}
