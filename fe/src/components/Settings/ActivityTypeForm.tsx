import React from 'react';
import { TextField, Grid, FormControlLabel, Switch } from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import IconSelector from '../common/IconSelector';
import { ActivityTypeFormProps } from '../../types/setting';

/**
 * Render a form for editing activity type properties including name, color,
 * icon, description, and active status.
 *
 * @param root0 Object containing formData with activity type fields and
 *   onChange callback to handle field updates
 */
export const ActivityTypeForm: React.FC<ActivityTypeFormProps> = ({
  formData,
  onChange,
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
        <MuiColorInput
          format="hex"
          label="Color"
          value={formData?.color || '#2196f3'}
          onChange={(value) => onChange('color', value)}
          fullWidth
          required
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <IconSelector
          value={formData?.icon}
          onChange={(icon) => onChange('icon', icon)}
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
