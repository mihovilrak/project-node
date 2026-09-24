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

/**
 * Extend user information with resolved status and role names along with the most recent login timestamp.
 */
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

/**
 * Specify filtering criteria and deletion visibility for user queries.
 */
export interface UserQueryFilters {
  whereParams: {
    [key: string]: string;
  };
  includeDeleted?: boolean;
}

/**
 * Represent a user status with an identifier, display name, and optional color for UI rendering.
 */
export interface UserStatus {
  id: number;
  name: string;
  color?: string;
}

export interface UserRole {
  id: number;
  name: string;
}

/**
 * Represent a permission granted to a user with its assignment timestamp.
 */
export interface UserPermission {
  user_id: number;
  permission: string;
  granted_on: Date;
}

/**
 * Represent an authenticated user session with expiration and user context.
 */
export interface UserSession {
  id: number;
  user_id: number;
  expires: Date;
  data: {
    user: User;
  };
  user: User;
}
