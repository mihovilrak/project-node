import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  FormControlLabel,
  Switch,
  IconButton,
  Box,
  FormControl,
  InputLabel
} from '@mui/material';
import { Icon } from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import { createActivityType, updateActivityType, getAvailableIcons } from '../../api/activityTypes';

// IconSelector component
function IconSelector({ value, onChange }) {
  const [icons, setIcons] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadIcons = async () => {
      try {
        const availableIcons = await getAvailableIcons();
        setIcons(availableIcons);
      } catch (error) {
        console.error('Failed to load icons:', error);
      }
    };
    loadIcons();
  }, []);

  return (
    <FormControl fullWidth margin="normal">
      <InputLabel shrink>Icon</InputLabel>
      <Box mt={2}>
        <IconButton 
          onClick={() => setOpen(true)}
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

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Select an Icon</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ p: 2 }}>
            {icons.map((iconName) => (
              <Grid item key={iconName}>
                <IconButton
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
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
}

const ActivityTypeDialog = ({ open, activityType, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#2196f3',
    description: '',
    active: true,
    icon: null
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activityType) {
      setFormData(activityType);
    } else {
      setFormData({
        name: '',
        color: '#2196f3',
        description: '',
        active: true,
        icon: null
      });
    }
  }, [activityType]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (activityType) {
        await updateActivityType(activityType.id, formData);
      } else {
        await createActivityType(formData);
      }
      onSaved();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save activity type');
      console.error('Failed to save activity type:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {activityType ? 'Edit Activity Type' : 'Create Activity Type'}
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
              <MuiColorInput
                label="Color"
                value={formData.color}
                onChange={(value) => handleChange('color', value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <IconSelector
                value={formData.icon}
                onChange={(icon) => handleChange('icon', icon)}
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
          <Button type="submit" variant="contained" color="primary">
            {activityType ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ActivityTypeDialog; 