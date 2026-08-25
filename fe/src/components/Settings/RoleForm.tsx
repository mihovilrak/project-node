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
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Name"
          value={formData?.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Description"
          value={formData?.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" gutterBottom>
          Permissions
        </Typography>
        {groupedPermissions && Object.keys(groupedPermissions).length > 0 ? (
          (() => {
            const entries = Object.entries(groupedPermissions);
            const mid = Math.ceil(entries.length / 2);
            const leftColumn = entries.slice(0, mid);
            const rightColumn = entries.slice(mid);
            const renderCategory = (category: string, permissions: typeof entries[0][1]) => (
              <Box key={category || Math.random()} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {category || 'Unknown'}
                </Typography>
                <Box sx={{ ml: 2 }}>
                  {(permissions || []).map(permission => {
                    if (!permission?.id) return null;
                    return (
                      <FormControlLabel
                        key={permission.id}
                        control={
                          <Checkbox
                            checked={(formData?.permissions || []).includes(permission.id)}
                            onChange={() => onPermissionToggle(permission)}
                          />
                        }
                        label={permission?.name || 'Unknown Permission'}
                      />
                    );
                  })}
                </Box>
              </Box>
            );
            return (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  {leftColumn.map(([category, permissions]) => renderCategory(category, permissions))}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  {rightColumn.map(([category, permissions]) => renderCategory(category, permissions))}
                </Grid>
              </Grid>
            );
          })()
        ) : (
          <Typography variant="body2" color="text.secondary">
            No permissions available
          </Typography>
        )}
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formData?.active ?? true}
              onChange={(e) => onChange('active', e.target.checked)}
            />
          }
          label="Active"
        />
      </Grid>
    </Grid>
  );
};
