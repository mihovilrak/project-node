import React, { useCallback, useMemo } from 'react';
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

// Memoize tab components to prevent unnecessary re-renders
const MemoizedUserManager = React.memo(UserManager);
const MemoizedTypesAndRolesManager = React.memo(TypesAndRolesManager);
const MemoizedSystemSettings = React.memo(SystemSettings);

const Settings: React.FC = () => {
  const { permissionsLoading } = useAuth();
  const [activeTab, setActiveTab] = React.useState<number>(0);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  }, []);

  const activeTabContent = useMemo(() => {
    switch (activeTab) {
      case 0:
        return <MemoizedUserManager />;
      case 1:
        return <MemoizedTypesAndRolesManager />;
      case 2:
        return <MemoizedSystemSettings />;
      default:
        return null;
    }
  }, [activeTab]);

  if (permissionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

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

      {activeTabContent}
    </Box>
  );
};

export default Settings;
