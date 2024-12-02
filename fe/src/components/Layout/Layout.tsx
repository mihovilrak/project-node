import React from 'react';
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Box,
  Button
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../../hooks/useNavigation';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { activeTab, handleTabChange } = useNavigation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Tabs value={activeTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary">
            <Tab label="Home" />
            <Tab label="Projects" />
            <Tab label="Users" />
            <Tab label="Tasks" />
            <Tab label="Settings" />
            <Tab label="Account" />
          </Tabs>
          <Button color="inherit" onClick={handleLogout} sx={{ marginLeft: 'auto' }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box p={3}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 