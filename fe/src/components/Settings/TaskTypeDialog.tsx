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
  Alert,
} from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import { TaskTypeDialogProps } from '../../types/setting';
import IconSelector from '../common/IconSelector';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const TaskTypeDialog: React.FC<TaskTypeDialogProps> = ({
  open,
  taskType,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#2196f3',
    description: '',
    icon: 'Task' as string | undefined,
    active: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskType) {
      setFormData({
        name: taskType?.name || '',
        color: taskType?.color || '#2196f3',
        description: taskType?.description || '',
        icon: taskType?.icon || 'Task',
        active: taskType?.active ?? true,
      });
    } else {
      setFormData({
        name: '',
        color: '#2196f3',
        description: '',
        icon: 'Task',
        active: true,
      });
    }
  }, [taskType]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Ensure icon is provided (required by database)
    if (!formData.icon || formData.icon.trim() === '') {
      setError('Icon is required');
      return;
    }

    try {
      await onSave(taskType ? { ...formData, id: taskType.id } : formData);
      onClose();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'Failed to save task type'));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="task-type-dialog-title-2"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="task-type-dialog-title-2">
          {taskType ? 'Edit Task Type' : 'Create Task Type'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <MuiColorInput
                format="hex"
                label="Color"
                value={formData.color}
                onChange={(value) => handleChange('color', value)}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <IconSelector
                value={formData.icon}
                onChange={(icon) => handleChange('icon', icon)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
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
