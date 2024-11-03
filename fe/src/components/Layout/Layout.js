import React from 'react';
import { AppBar, Toolbar, Tabs, Tab, Box, Button } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [value, setValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/projects');
        break;
      case 2:
        navigate('/users');
        break;
      case 3:
        navigate('/tasks');
        break;
      case 4:
        navigate('/settings');
        break;
      case 5:
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Tabs value={value} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary">
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

      {/* Dynamic content will be rendered here based on the tab selected */}
      <Box p={3}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
