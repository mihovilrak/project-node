import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  MenuItem, 
  Box, 
  Typography, 
  Paper,
  Grid,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  fetchRoles,
  createUser,
  getUserById,
  updateUser,
} from '../../api/users';
import { Role } from '../../types/admin';
import {
  FormData,
  UserCreate,
  UserUpdate,
  UserFormProps,
} from '../../types/user';

const UserForm: React.FC<UserFormProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formValues, setFormValues] = useState<FormData>({
    login: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    role_id: 4,
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const roleData = await fetchRoles();
        setRoles(roleData);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch roles', error);
        setError('Failed to load roles');
      } finally {
        setLoading(false);
      }
    };

    loadRoles();

    if (userId) {
      fetchUserData(parseInt(userId));
    }
  }, [userId]);

  const fetchUserData = async (id: number) => {
    try {
      const user = await getUserById(id);
      setFormValues({
        login: user.login,
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: '',
        role_id: user.role_id || 4,
      });
    } catch (error) {
      console.error('Failed to fetch user data', error);
      setError('Failed to fetch user data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (userId) {
        await updateUser(parseInt(userId), formValues as UserUpdate);
      } else {
        await createUser(formValues as UserCreate);
      }
      navigate('/users');
    } catch (error) {
      console.error('Failed to save user', error);
      setError('Failed to save user');
    }
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          {userId ? 'Edit User' : 'Add New User'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Login"
                name="login"
                value={formValues.login}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="surname"
                value={formValues.surname}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={userId ? "New Password (leave blank to keep current)" : "Password"}
                name="password"
                type="password"
                value={formValues.password}
                onChange={handleInputChange}
                required={!userId}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Role"
                name="role_id"
                value={formValues.role_id}
                onChange={handleInputChange}
                required
                disabled={loading}
                error={!!error}
              >
                {loading ? (
                  <MenuItem disabled>Loading roles...</MenuItem>
                ) : roles.length === 0 ? (
                  <MenuItem disabled>No roles available</MenuItem>
                ) : (
                  roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                >
                  {userId ? 'Update User' : 'Create User'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UserForm;
