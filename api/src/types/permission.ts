export type Permission =
| 'Admin'
| 'Create projects'
| 'Edit projects'
| 'Delete projects'
| 'Create tasks'
| 'Edit tasks'
| 'Delete tasks'
| 'Log time'
| 'Edit log'
| 'Delete log'
| 'Delete files';

export interface UserPermission {
  user_id: string;
  permission: Permission;
}

export interface RolePermission {
  role_id: string;
  permission: Permission;
}

export interface PermissionCheck {
  hasPermission: boolean;
}
