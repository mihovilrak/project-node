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
import { useNavigate, Link } from 'react-router-dom';
import { useNavigation } from '../../hooks/layout/useNavigation';
import {
  Brightness4,
  Brightness7,
  AccountCircle,
  ExitToApp
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import NotificationCenter from '../Notifications/NotificationCenter';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const { activeTab } = useNavigation();
  const { mode, toggleTheme } = useTheme();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Tabs value={activeTab} textColor="inherit" indicatorColor="secondary">
            <Tab label="Home" component={Link} to="/" />
            <Tab label="Projects" component={Link} to="/projects" />
            <Tab label="Users" component={Link} to="/users" />
            <Tab label="Tasks" component={Link} to="/tasks" />
            <Tab label="Settings" component={Link} to="/settings" />
          </Tabs>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1 }}>
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>
          {currentUser?.id && (
            <Tooltip title="Notifications">
              <span>
                <NotificationCenter userId={currentUser.id} />
              </span>
            </Tooltip>
          )}
          {currentUser && (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/profile')}
                startIcon={<AccountCircle />}
                sx={{ ml: 2 }}
              >
                {currentUser?.login || 'User'}
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
          maxWidth: 1400,
          margin: '0 auto',
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
