import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box
} from '@mui/material';
import {
  PasswordChangeDialogProps,
  PasswordForm
} from '../../types/profile';
import { changePassword } from '../../api/profiles';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof PasswordForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword
      });
      onClose();
    } catch (err: unknown) {
      logger.error('Failed to change password:', err);
      setError(getApiErrorMessage(err, 'Failed to change password. Please check your current password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth data-testid="password-change-dialog">
      <DialogTitle data-testid="dialog-title">Change Password</DialogTitle>
      <form onSubmit={handleSubmit} data-testid="password-form">
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} data-testid="error-alert">
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Current Password"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange('currentPassword')}
              fullWidth
              required
              data-testid="current-password-field"
            />
            <TextField
              label="New Password"
              type="password"
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              fullWidth
              required
              data-testid="new-password-field"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              fullWidth
              required
              data-testid="confirm-password-field"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} data-testid="cancel-button">Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            data-testid="submit-button"
          >
            Change Password
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PasswordChangeDialog;
