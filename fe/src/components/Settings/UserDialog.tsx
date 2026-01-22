import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { UserDialogProps } from '../../types/user';
import { useUserDialog } from '../../hooks/setting/useUserDialog';

const UserDialog: React.FC<UserDialogProps> = ({ open, user, onClose, onUserSaved }) => {
  const {
    formData,
    error,
    handleTextChange,
    handleRoleChange,
    handleSubmit
  } = useUserDialog(user, open, onClose, onUserSaved);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} role="form">
        <DialogTitle>
          {user ? `Edit user ${user.name} ${user.surname}` : 'Create New User'}
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
                name="login"
                label="Login"
                value={formData.login}
                onChange={handleTextChange}
                fullWidth
                required
                disabled={!!user}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="name"
                label="First Name"
                value={formData.name}
                onChange={handleTextChange}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="surname"
                label="Last Name"
                value={formData.surname}
                onChange={handleTextChange}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleTextChange}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="password"
                label={user ? "New Password (leave empty to keep current)" : "Password"}
                type="password"
                value={formData.password}
                onChange={handleTextChange}
                fullWidth
                required={!user}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  value={formData.role_id}
                  onChange={handleRoleChange}
                  label="Role"
                  required
                >
                  <MenuItem value={1}>Admin</MenuItem>
                  <MenuItem value={2}>Manager</MenuItem>
                  <MenuItem value={3}>User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {user ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserDialog;
