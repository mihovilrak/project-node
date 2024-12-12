import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  getSystemSettings,
  updateSystemSettings
} from '../../api/settings';
import { SystemSettingsState } from '../../types/settings';

const SystemSettings: React.FC = () => {
  const [state, setState] = useState<SystemSettingsState>({
    settings: {
      id: 1,
      app_name: '',
      company_name: '',
      sender_email: '',
      time_zone: '',
      theme: ''
    },
    loading: true,
    error: null,
    success: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const data = await getSystemSettings();
      setState(prev => ({ 
        ...prev, 
        settings: data,
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch system settings',
        loading: false 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setState(prev => ({ ...prev, loading: true }));
      await updateSystemSettings(state.settings);
      setState(prev => ({ 
        ...prev, 
        success: true,
        loading: false 
      }));
      setTimeout(() => setState(prev => ({ ...prev, success: false })), 3000);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to update settings',
        loading: false 
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, [name]: value }
    }));
  };

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

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          name="app_name"
          label="App Name"
          value={state.settings.app_name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          name="company_name"
          label="Company Name"
          value={state.settings.company_name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          name="sender_email"
          label="Sender Email"
          value={state.settings.sender_email}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          name="time_zone"
          label="Time Zone"
          value={state.settings.time_zone}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          name="theme"
          label="Theme"
          value={state.settings.theme}
          onChange={handleChange}
          margin="normal"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
        >
          Save Changes
        </Button>
      </Box>
    </Paper>
  );
};

export default SystemSettings; 