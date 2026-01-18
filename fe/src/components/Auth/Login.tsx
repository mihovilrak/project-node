import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLogin } from '../../hooks/auth/useLogin';

const Login: React.FC = () => {
  const {
    loginDetails,
    error,
    handleInputChange,
    handleSubmit
  } = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login
        </Typography>
        {error && (
          <Typography variant="body2" color="error" align="center" data-testid="login-error">
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit} role="form">
          <Box mb={3}>
            <TextField
              label="Username"
              name="login"
              fullWidth
              required
              value={loginDetails.login}
              onChange={handleInputChange}
              autoComplete="username"
              inputProps={{ 'data-testid': 'login-input' }}
              InputLabelProps={{
                sx: { background: 'white', px: 1 }
              }}
            />
          </Box>
          <Box mb={3}>
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={loginDetails.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              inputProps={{ 'data-testid': 'password-input' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      data-testid="toggle-password-visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                sx: { background: 'white', px: 1 }
              }}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            data-testid="login-submit"
          >
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
