import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { ProfileHeaderProps } from '../../types/profile';
import { getSafeImageUrl } from '../../utils/urlSafety';

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        mb: 4,
      }}
    >
      <Avatar
        src={getSafeImageUrl(user?.avatar_url)}
        alt={`${user?.name || ''} ${user?.surname || ''}`}
        sx={{ width: 80, height: 80 }}
        data-testid="user-avatar"
      />
      <Box>
        <Typography variant="h4" gutterBottom>
          {user?.name || ''} {user?.surname || ''}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user?.email || 'No email'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.role_name || 'No role'}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileHeader;
