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
  Switch
} from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import { createActivityType, updateActivityType } from '../../api/activityTypes';

const ActivityTypeDialog = ({ open, activityType, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#2196f3',
    description: '',
    is_active: true
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
        is_active: true
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
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
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