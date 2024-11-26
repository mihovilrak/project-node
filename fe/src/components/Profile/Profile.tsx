import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  Grid
} from '@mui/material';
import { Edit, Lock } from '@mui/icons-material';
import { useProfileData } from '../../hooks/useProfileData';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileTaskList from './ProfileTaskList';
import ProfileEditDialog from './ProfileEditDialog';
import PasswordChangeDialog from './PasswordChangeDialog';
import ProfileProjectList from './ProfileProjectList';
import { updateProfile } from '../../api/profile';
import type { ProfileData, ProfileUpdateData } from '../../types/profile';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { 
    profile, 
    recentTasks, 
    recentProjects, 
    loading, 
    error,
    refreshData 
  } = useProfileData();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const navigate = useNavigate();

  const handleProfileUpdate = async (updatedProfile: ProfileUpdateData) => {
    try {
      await updateProfile(updatedProfile);
      await refreshData();
      setEditDialogOpen(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!profile) {
    return null;
  }

  // Type assertion here to tell TypeScript what profile looks like
  const typedProfile = profile as ProfileData;

  const stats = {
    totalTasks: typedProfile.total_tasks ?? 0,
    completedTasks: typedProfile.completed_tasks ?? 0,
    activeProjects: typedProfile.active_projects ?? 0,
    totalHours: typedProfile.total_hours ?? 0
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {updateSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setUpdateSuccess(false)}
        >
          Profile updated successfully
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          startIcon={<Edit />}
          variant="outlined"
          onClick={() => setEditDialogOpen(true)}
        >
          Edit Profile
        </Button>
        <Button
          startIcon={<Lock />}
          variant="outlined"
          onClick={() => setPasswordDialogOpen(true)}
        >
          Change Password
        </Button>
      </Box>

      <ProfileHeader user={profile} />
      
      <ProfileStats
        stats={stats}
        loading={loading}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <ProfileTaskList 
              tasks={recentTasks} 
              loading={loading}
              onTaskClick={handleTaskClick}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <ProfileProjectList 
              projects={recentProjects}
              loading={loading}
            />
          </Paper>
        </Grid>
      </Grid>

      <ProfileEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        profile={profile as ProfileData}
        onProfileUpdate={handleProfileUpdate}
      />

      <PasswordChangeDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </Container>
  );
};

export default Profile; 