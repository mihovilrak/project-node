import React from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper
} from '@mui/material';
import { useLogin } from '../../hooks/useLogin';

const Login: React.FC = () => {
  const {
    loginDetails,
    error,
    handleInputChange,
    handleSubmit
  } = useLogin();

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login
        </Typography>
        {error && (
          <Typography variant="body2" color="error" align="center">
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <TextField
              label="Username"
              name="login"
              fullWidth
              value={loginDetails.login}
              onChange={handleInputChange}
              required
            />
          </Box>
          <Box mb={3}>
            <TextField
              label="Password"
              type="password"
              name="password"
              fullWidth
              value={loginDetails.password}
              onChange={handleInputChange}
              required
            />
          </Box>
          <Box mb={2} textAlign="center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ padding: 1.5 }}
            >
              Login
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;