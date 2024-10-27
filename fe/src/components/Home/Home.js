// src/components/Home/Home.js

import React from 'react';
import { Box, Typography } from '@mui/material';

const Home = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Welcome to the Dashboard</Typography>
      <Typography variant="body1">Manage your projects, users, tasks, and settings from here.</Typography>
    </Box>
  );
};

export default Home;
