export interface Permission {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
  // Virtual fields from joins
  permissions?: Permission[];
}

export interface RolePermission {
  role_id: number;
  permission_id: number;
  created_on: string;
}

// Admin check response
export interface AdminCheckResponse {
  is_admin: boolean;
}