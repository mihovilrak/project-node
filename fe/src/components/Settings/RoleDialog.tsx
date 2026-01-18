import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import { Role } from '../../types/role';
import { RoleDialogProps } from '../../types/role';
import { useRoleDialog } from '../../hooks/setting/useRoleDialog';
import { RoleForm } from './RoleForm';

const RoleDialog: React.FC<RoleDialogProps> = ({ open, role, onClose, onSave }) => {
  const {
    formData,
    error,
    groupedPermissions,
    handleChange,
    handlePermissionToggle,
    clearError,
    setError
  } = useRoleDialog(role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const roleData: Partial<Role> = {
      name: formData.name,
      description: formData.description,
      active: formData.active,
      permissions: formData.permissions
    };

    try {
      await onSave(roleData);
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save role');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form role="form" onSubmit={handleSubmit}>
        <DialogTitle>
          {role ? 'Edit Role' : 'Create Role'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <RoleForm
            formData={formData}
            groupedPermissions={groupedPermissions}
            onChange={handleChange}
            onPermissionToggle={handlePermissionToggle}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            {role ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RoleDialog;
