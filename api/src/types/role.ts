export interface Role {
  id: string;
  name: string;
  description?: string;
  created_on: Date;
  updated_on: Date;
  active: boolean;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  created_on: Date;
  updated_on: Date;
  active: boolean;
}

export interface RoleCreateInput {
  name: string;
  description?: string;
  permissions?: number[];
}

export interface RoleUpdateInput {
  name?: string;
  description?: string;
  active?: boolean;
  permissions?: number[];
}
