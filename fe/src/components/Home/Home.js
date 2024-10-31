// src/components/Home/Home.js

import React from 'react';
import ActiveTasks from '../Tasks/ActiveTasks';
import { Box } from '@mui/material';

const Home = () => {
  return (
    <Box>
      <ActiveTasks />
    </Box>
  );
};

export default Home;
