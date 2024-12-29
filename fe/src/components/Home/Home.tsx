import React from 'react';
import ActiveTasks from './ActiveTasks';
import { Box } from '@mui/material';

const Home: React.FC = (): React.ReactElement => {
  return (
    <Box>
      <ActiveTasks />
    </Box>
  );
};

export default Home;
