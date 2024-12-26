import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useSystemSettings } from '../../hooks/setting/useSystemSettings';

const SystemSettings: React.FC = () => {
  const { state, handleSubmit, handleChange } = useSystemSettings();

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        System Settings
      </Typography>

      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}

      {state.success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings updated successfully
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="App Name"
            name="app_name"
            value={state.settings.app_name || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Company Name"
            name="company_name"
            value={state.settings.company_name || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Sender Email"
            name="sender_email"
            value={state.settings.sender_email || ''}
            onChange={handleChange}
            fullWidth
            type="email"
          />
          <TextField
            label="Time Zone"
            name="time_zone"
            value={state.settings.time_zone || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Theme"
            name="theme"
            value={state.settings.theme || ''}
            onChange={handleChange}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={state.loading}
            sx={{ mt: 2 }}
          >
            {state.loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default SystemSettings;
