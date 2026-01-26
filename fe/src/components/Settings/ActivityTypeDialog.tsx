import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import { ActivityTypeDialogProps } from '../../types/setting';
import { useActivityTypeDialog } from '../../hooks/setting/useActivityTypeDialog';
import { ActivityTypeForm } from './ActivityTypeForm';

const ActivityTypeDialog: React.FC<ActivityTypeDialogProps> = ({ open, activityType, onClose, onSave }) => {
  const {
    formData,
    error,
    handleChange,
    setError,
    clearError
  } = useActivityTypeDialog(activityType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to save activity type';
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} role="form" aria-label="activity-type-form">
        <DialogTitle>
          {activityType ? 'Edit Activity Type' : 'Create Activity Type'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <ActivityTypeForm
            formData={formData}
            onChange={handleChange}
          />
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
