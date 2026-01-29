import React from 'react';
import {
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { MuiColorInput } from 'mui-color-input';
import { useIconSelector } from '../../hooks/setting/useIconSelector';
import {
  ActivityTypeFormProps,
  IconSelectorProps
} from '../../types/setting';

const IconSelector = ({ value, onChange }: IconSelectorProps) => {
  const {
    icons,
    open,
    handleOpen,
    handleClose,
    handleSelect
  } = useIconSelector(value);

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    try {
      const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
      return IconComponent ? <IconComponent /> : null;
    } catch {
      return null;
    }
  };

  return (
    <FormControl fullWidth margin="normal">
      <InputLabel shrink>Icon</InputLabel>
      <Box mt={2}>
        <IconButton
          onClick={handleOpen}
          sx={{
            border: '1px dashed grey',
            borderRadius: 1,
            width: '100%',
            height: '56px'
          }}
        >
          {value ? getIconComponent(value) || value : 'Select Icon'}
        </IconButton>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select an Icon</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ p: 2 }}>
            {(icons || []).map((iconName) => {
              const IconComponent = iconName ? getIconComponent(iconName) : null;
              return (
                <Grid key={iconName || Math.random()} size={{ xs: 6, sm: 4 }}>
                  <IconButton
                    onClick={() => {
                      if (iconName) {
                        handleSelect(iconName);
                        onChange(iconName);
                      }
                    }}
                    disabled={!iconName}
                    sx={{
                      border: value === iconName ? '2px solid primary.main' : 'none',
                      borderRadius: 1
                    }}
                  >
                    {IconComponent || iconName || 'Unknown'}
                  </IconButton>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
      </Dialog>
    </FormControl>
  );
};

export const ActivityTypeForm: React.FC<ActivityTypeFormProps> = ({ formData, onChange }) => {
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
