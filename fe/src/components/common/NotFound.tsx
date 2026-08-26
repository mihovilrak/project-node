import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const NotFound: React.FC = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h4" component="h1" gutterBottom>
      404 — Page not found
    </Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      The page you are looking for does not exist or has been moved.
    </Typography>
    <Button component={RouterLink} to="/" variant="contained">
      Back to home
    </Button>
  </Box>
);

export default NotFound;
