import { useState, useEffect } from 'react';
import { Role } from '../../types/role';
import { Permission } from '../../types/setting';
import { RoleFormData } from '../../types/role';
import { getAllPermissions } from '../../api/permissions';

export const useRoleDialog = (role: Role | undefined) => {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    active: true,
    permissions: []
  });
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        active: role.active ?? true,
        permissions: role.permissions || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        active: true,
        permissions: []
      });
    }
  }, [role]);

  const fetchPermissions = async () => {
    try {
      const permissions = await getAllPermissions();
      setAvailablePermissions(permissions);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setError('Failed to load permissions');
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permission: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.some(p => p.id === permission.id)
        ? prev.permissions.filter(p => p.id !== permission.id)
        : [...prev.permissions, permission]
    }));
  };

  const clearError = () => setError(undefined);

  const groupedPermissions = availablePermissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    const category = permission.name.split('_')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  return {
    formData,
    error,
    groupedPermissions,
    handleChange,
    handlePermissionToggle,
    clearError,
    setError
  };
};
