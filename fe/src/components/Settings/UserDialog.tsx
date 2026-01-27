import React, { useState } from 'react';
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
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { UserDialogProps } from '../../types/user';
import { useUserDialog } from '../../hooks/setting/useUserDialog';

const UserDialog: React.FC<UserDialogProps> = ({ open, user, onClose, onUserSaved }) => {
  const {
    formData,
    error,
    roles,
    rolesLoading,
    handleTextChange,
    handleRoleChange,
    handleSubmit
  } = useUserDialog(user, open, onClose, onUserSaved);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleTextChange}
                fullWidth
                required={!user}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        data-testid="toggle-password-visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {(user ? formData.password : true) && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="confirmPassword"
                  label={user ? "Confirm New Password" : "Confirm Password"}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword || ''}
                  onChange={handleTextChange}
                  fullWidth
                  required={!user || !!formData.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          data-testid="toggle-confirm-password-visibility"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  value={formData.role_id}
                  onChange={handleRoleChange}
                  label="Role"
                  required
                  disabled={rolesLoading}
                >
                  {rolesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading roles...
                    </MenuItem>
                  ) : roles.length === 0 ? (
                    <MenuItem disabled>No roles available</MenuItem>
                  ) : (
                    roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))
                  )}
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
