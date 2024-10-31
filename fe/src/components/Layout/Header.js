import React from 'react';
import { AppBar, Toolbar, Box } from '@mui/material';
import NotificationCenter from '../Notifications/NotificationCenter';

const Header = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* ... other header content ... */}
        <Box sx={{ flexGrow: 1 }} />
        <NotificationCenter />
        {/* ... other header content ... */}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 