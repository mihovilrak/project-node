import React from 'react';
import { AppBar, Toolbar, Box } from '@mui/material';
import NotificationCenter from '../Notifications/NotificationCenter';
import { useHeader } from '../../hooks/layout/useHeader';

const Header: React.FC = () => {
  const { currentUser, isScrolled } = useHeader();

  return (
    <AppBar
      position="fixed"
      elevation={isScrolled ? 4 : 0}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1 }} />
        {currentUser?.id && (
          <NotificationCenter userId={currentUser.id} />
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
