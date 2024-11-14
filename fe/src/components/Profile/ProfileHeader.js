import React from 'react';
import {
  Box,
  Avatar,
  Typography,
  Paper,
  Chip
} from '@mui/material';

const ProfileHeader = ({ user }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{ width: 80, height: 80 }}
          src={user.avatar_url}
          alt={user.name}
        >
          {user.name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h5">{user.name}</Typography>
          <Typography variant="body1" color="textSecondary">
            {user.email}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={user.role} 
              color="primary" 
              variant="outlined" 
              size="small" 
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileHeader; 