import { Permission } from './admin';

/**
 * Define a role with identity, descriptive metadata, active status, timestamps, and associated permissions.
 */
export interface Role {
  id: number;
  name: string;
  description?: string | null;
  active?: boolean;
  created_on?: string;
  updated_on?: string | null;
  // Virtual fields from joins
  permissions?: Permission[] | number[];
}

/**
 * Specify props for a roles table component, including the roles list, edit and optional delete handlers, a loading indicator, and a manage permission flag.
 */
export interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete?: (id: number) => Promise<void>;
  loading?: boolean;
  canManage?: boolean;
}

/**
 * Define the form payload used when creating or editing a role, including its display name, description text, active status, and associated permission IDs.
 */
export interface RoleFormData {
  name: string;
  description: string;
  active: boolean;
  permissions: number[];
}

export interface RoleFormProps {
  formData: RoleFormData;
  groupedPermissions: Record<string, Permission[]>;
  onChange: (field: string, value: string | boolean) => void;
  onPermissionToggle: (permission: Permission) => void;
}

export interface RoleDialogProps {
  open: boolean;
  role?: Role;
  onClose: () => void;
  onSave: (role: Partial<Role>) => Promise<void>;
}
