import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  Typography,
  Checkbox,
  Box
} from '@mui/material';
import { getAllPermissions } from '../../api/admin';
import { RoleDialogProps, Permission } from '../../types/settings';

const RoleDialog: React.FC<RoleDialogProps> = ({ open, role, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
    permissions: [] as Permission[]
  });
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        active: role.active ?? true,
        permissions: role.permissions
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save role');
    }
  };

  const groupedPermissions = availablePermissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    const category = permission.name.split('_')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {role ? 'Edit Role' : 'Create Role'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Permissions
              </Typography>
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {category}
                  </Typography>
                  <Box sx={{ ml: 2 }}>
                    {permissions.map(permission => (
                      <FormControlLabel
                        key={permission.id}
                        control={
                          <Checkbox
                            checked={formData.permissions.some(p => p.id === permission.id)}
                            onChange={() => handlePermissionToggle(permission)}
                          />
                        }
                        label={permission.name}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => handleChange('active', e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
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
