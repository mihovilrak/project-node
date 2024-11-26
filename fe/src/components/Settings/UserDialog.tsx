import React, { useState, useEffect } from 'react';
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
  SelectChangeEvent
} from '@mui/material';
import {
  User,
  UserDialogProps,
  FormData,
  UserUpdate,
  UserCreate
} from '../../types/user';
import { createUser, updateUser } from '../../api/users';

const UserDialog: React.FC<UserDialogProps> = ({ open, user, onClose, onUserSaved }) => {
  const [formData, setFormData] = useState<FormData>({
    login: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    role_id: 3
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        login: user.login,
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: '',
        role_id: user.role_id || 3
      });
    } else {
      setFormData({
        login: '',
        name: '',
        surname: '',
        email: '',
        password: '',
        role_id: 3
      });
    }
  }, [user]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent<number>): void => {
    setFormData(prev => ({
      ...prev,
      role_id: e.target.value as number
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      if (user) {
        await updateUser(user.id, formData as UserUpdate);
      } else {
        await createUser(formData as UserCreate);
      }
      onUserSaved(formData as User);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save user');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {user ? 'Edit User' : 'Create New User'}
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
                name="login"
                label="Login"
                value={formData.login}
                onChange={handleTextChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="First Name"
                value={formData.name}
                onChange={handleTextChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="surname"
                label="Last Name"
                value={formData.surname}
                onChange={handleTextChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <TextField
                name="password"
                label={user ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                value={formData.password}
                onChange={handleTextChange}
                fullWidth
                required={!user}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleRoleChange}
                  label="Role"
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