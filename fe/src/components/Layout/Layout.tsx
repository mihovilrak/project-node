import React from 'react';
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Box,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../../hooks/layout/useNavigation';
import {
  Brightness4,
  Brightness7,
  AccountCircle,
  ExitToApp
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const { activeTab, handleTabChange } = useNavigation();
  const { mode, toggleTheme } = useTheme();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Tabs value={activeTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary">
            <Tab label="Home" />
            <Tab label="Projects" />
            <Tab label="Users" />
            <Tab label="Tasks" />
            <Tab label="Settings" />
          </Tabs>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1 }}>
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>
          {currentUser && (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/profile')}
                startIcon={<AccountCircle />}
                sx={{ ml: 2 }}
              >
                {currentUser.login}
              </Button>
              <Button
                color="inherit"
                onClick={logout}
                startIcon={<ExitToApp />}
                sx={{ ml: 2 }}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          pt: '64px', // AppBar height
          px: 3,
          backgroundColor: 'background.default'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
