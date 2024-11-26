import React from 'react';
import { AppBar, Toolbar, Box } from '@mui/material';
import NotificationCenter from '../Notifications/NotificationCenter';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = (): JSX.Element => {
  const { currentUser } = useAuth();
  
  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* ... other header content ... */}
        <Box sx={{ flexGrow: 1 }} />
        <NotificationCenter userId={currentUser?.id || 0} />
        {/* ... other header content ... */}
      </Toolbar>
    </AppBar>
  );
};

export default Header;