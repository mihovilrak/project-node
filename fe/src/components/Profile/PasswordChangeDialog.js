import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { changePassword } from '../../api/profile';

const PasswordChangeDialog = ({ open, onClose }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      onClose();
      // You might want to show a success message here
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            name="currentPassword"
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwords.currentPassword}
            onChange={handleChange}
            required
          />
          <TextField
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwords.newPassword}
            onChange={handleChange}
            required
          />
          <TextField
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            Change Password
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

PasswordChangeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PasswordChangeDialog; 