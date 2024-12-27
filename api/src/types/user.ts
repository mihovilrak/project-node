export interface User {
  id: string;
  login: string;
  name: string;
  surname: string;
  email: string;
  status: string;
  role: string;
  created_on: Date;
  updated_on: Date;
  last_login?: Date | null;
}

export interface UserDetails extends User {
  role_name: string;
  status_name: string;
  full_name: string;
}

export interface UserCreateInput {
  login: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  role_id: string;
}

export interface UserUpdateInput {
  login?: string;
  name?: string;
  surname?: string;
  email?: string;
  password?: string;
  role_id?: string;
  status_id?: string;
}

export interface UserQueryFilters {
  whereParams: {
    [key: string]: string;
  };
}

export interface UserStatus {
  id: string;
  name: string;
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
}

export interface UserPermission {
  user_id: string;
  permission: string;
  granted_on: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  expires: Date;
  data: {
    user: User;
  };
}
