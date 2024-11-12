import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import UserManager from './UserManager';
import TypesAndRolesManager from './TypesAndRolesManager';
import SystemSettings from './SystemSettings';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState(0);

  if (!user?.role_id === 1) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to access this page.
        </Alert>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Users" />
          <Tab label="Types & Roles" />
          <Tab label="System" />
        </Tabs>
      </Paper>

      {activeTab === 0 && <UserManager />}
      {activeTab === 1 && <TypesAndRolesManager />}
      {activeTab === 2 && <SystemSettings />}
    </Box>
  );
};

export default Settings;