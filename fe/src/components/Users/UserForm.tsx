import React from 'react';
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
import { UserFormProps } from '../../types/user';
import { useUserForm } from '../../hooks/user/useUserForm';

const UserForm: React.FC<UserFormProps> = ({ userId }) => {
  const {
    loading,
    error,
    roles,
    formValues,
    handleInputChange,
    handleSubmit,
  } = useUserForm({ userId });

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
