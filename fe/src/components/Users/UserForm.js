import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchRoles, createUser, getUserById, updateUser } from '../../api/users';

const UserForm = ({ userId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [formValues, setFormValues] = useState({
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
        const transformedRoles = roleData.map(role => ({
          id: role.id,
          role: role.name
        }));
        setRoles(transformedRoles);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch roles', error);
        setError('Failed to load roles');
      } finally {
        setLoading(false);
      }
    };

    loadRoles();

    // If editing an existing user, fetch their data
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  // Fetch user data if editing
  const fetchUserData = async (id) => {
    try {
      const user = await getUserById(id);
      setFormValues(user);
    } catch (error) {
      console.error('Failed to fetch user data', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (userId) {
        await updateUser(userId, formValues);
        console.log('User updated successfully');
      } else {
        await createUser(formValues);
        console.log('User created successfully');
      }
      navigate('/users');
    } catch (error) {
      console.error('Failed to save user', error);
    }
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          {userId ? 'Edit User' : 'Add New User'}
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Login"
            name="login"
            value={formValues.login}
            onChange={handleInputChange}
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="First Name"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Last Name"
            name="surname"
            value={formValues.surname}
            onChange={handleInputChange}
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleInputChange}
            required
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formValues.password}
            onChange={handleInputChange}
            required={!userId}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Role"
            name="role_id"
            value={formValues.role_id}
            onChange={handleInputChange}
            required
            disabled={loading}
            error={!!error}
            sx={{ marginBottom: 2 }}
          >
            {loading ? (
              <MenuItem disabled>Loading roles...</MenuItem>
            ) : roles.length === 0 ? (
              <MenuItem disabled>No roles available</MenuItem>
            ) : (
              roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.role}
                </MenuItem>
              ))
            )}
          </TextField>
          <Box sx={{ textAlign: 'center', marginTop: 3 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {userId ? 'Update User' : 'Create User'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default UserForm;
