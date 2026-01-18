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
import { Icon } from '@mui/material';
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
          {value ? <Icon>{value}</Icon> : 'Select Icon'}
        </IconButton>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select an Icon</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ p: 2 }}>
            {icons.map((iconName) => (
              <Grid item key={iconName}>
                <IconButton
                  onClick={() => {
                    handleSelect(iconName);
                    onChange(iconName);
                  }}
                  sx={{
                    border: value === iconName ? '2px solid primary.main' : 'none',
                    borderRadius: 1
                  }}
                >
                  <Icon>{iconName}</Icon>
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </FormControl>
  );
};

export const ActivityTypeForm: React.FC<ActivityTypeFormProps> = ({ formData, onChange }) => {
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
        <MuiColorInput
          label="Color"
          value={formData.color}
          onChange={(value) => onChange('color', value)}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12}>
        <IconSelector
          value={formData.icon}
          onChange={(icon) => onChange('icon', icon)}
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
