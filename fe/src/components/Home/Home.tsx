import React from 'react';
import ActiveTasks from './ActiveTasks';
import { Box } from '@mui/material';

const Home: React.FC = (): JSX.Element => {
  return (
    <Box>
      <ActiveTasks />
    </Box>
  );
};

export default Home;
