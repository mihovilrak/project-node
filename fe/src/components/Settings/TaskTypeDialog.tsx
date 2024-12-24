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
import { TaskTypeDialogProps } from '../../types/settings';

const TaskTypeDialog: React.FC<TaskTypeDialogProps> = ({ open, taskType, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#2196f3',
    description: '',
    active: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskType) {
      setFormData({
        name: taskType.name,
        color: taskType.color,
        description: taskType.description || '',
        active: taskType.active
      });
    } else {
      setFormData({
        name: '',
        color: '#2196f3',
        description: '',
        active: true
      });
    }
  }, [taskType]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save task type');
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
            {taskType ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskTypeDialog;
