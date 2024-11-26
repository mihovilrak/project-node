import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper
} from '@mui/material';
import { LoginRequest } from '../../types/auth';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [loginDetails, setLoginDetails] = useState<LoginRequest>({ login: '', password: '' });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setLoginDetails((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      await login(loginDetails.login, loginDetails.password);
      navigate('/');
    } catch (error) {
      console.error(error);
      setError('Login error. Please try again.');
    }
  };

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