import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { ProfileHeaderProps } from '../../types/profile';

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      mb: 4
    }}>
      <Avatar
        src={user.avatar_url || undefined}
        alt={`${user.name} ${user.surname}`}
        sx={{ width: 80, height: 80 }}
      />
      <Box>
        <Typography variant="h4" gutterBottom>
          {user.name} {user.surname}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user.email}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.role}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileHeader;
