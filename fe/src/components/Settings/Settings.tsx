import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import UserManager from './UserManager';
import TypesAndRolesManager from './TypesAndRolesManager';
import SystemSettings from './SystemSettings';

const Settings: React.FC = () => {
  const { permissionsLoading } = useAuth();
  const [activeTab, setActiveTab] = React.useState<number>(0);

  if (permissionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
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