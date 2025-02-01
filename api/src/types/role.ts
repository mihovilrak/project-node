export interface Role {
  id: number;
  name: string;
  description?: string;
  created_on: Date;
  updated_on?: Date;
  active: boolean;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  created_on: Date;
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
