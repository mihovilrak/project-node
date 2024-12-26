import React from 'react';
import {
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Typography,
  Checkbox,
  Box
} from '@mui/material';
import { RoleFormProps } from '../../types/role';

export const RoleForm: React.FC<RoleFormProps> = ({
  formData,
  groupedPermissions,
  onChange,
  onPermissionToggle
}) => {
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12}>
        <TextField
          label="Name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
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
                      onChange={() => onPermissionToggle(permission)}
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
              onChange={(e) => onChange('active', e.target.checked)}
            />
          }
          label="Active"
        />
      </Grid>
    </Grid>
  );
};
