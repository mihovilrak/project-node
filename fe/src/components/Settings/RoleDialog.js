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
import { createRole, updateRole, getAllPermissions } from '../../api/admin';

const RoleDialog = ({ open, role, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    permissions: []
  });
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        is_active: role.is_active,
        permissions: role.permissions.map(p => p.id)
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true,
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

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (role) {
        await updateRole(role.id, formData);
      } else {
        await createRole(formData);
      }
      onSaved();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save role');
    }
  };

  // Group permissions by category (based on name prefix)
  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
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
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                          />
                        }
                        label={permission.description || permission.name}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RoleDialog; 