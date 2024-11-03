import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import { createTaskType, updateTaskType } from '../../api/admin';

const TaskTypeDialog = ({ open, taskType, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#2196f3',
    description: '',
    is_active: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (taskType) {
      setFormData(taskType);
    } else {
      setFormData({
        name: '',
        color: '#2196f3',
        description: '',
        is_active: true
      });
    }
  }, [taskType]);

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
      if (taskType) {
        await updateTaskType(taskType.id, formData);
      } else {
        await createTaskType(formData);
      }
      onSaved();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save task type');
      console.error('Failed to save task type:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {taskType ? 'Edit Task Type' : 'Create Task Type'}
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
            {taskType ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskTypeDialog; 