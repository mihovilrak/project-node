import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  CalendarToday as JoinedIcon,
  Assignment as TaskIcon,
  Folder as ProjectIcon
} from '@mui/icons-material';
import { getUserProfile } from '../../api/users';
import { getRecentTasks, getRecentProjects } from '../../api/profile';
import TaskList from './ProfileTaskList';
import ProjectList from './ProfileProjectList';
import ActivityTimeline from './ActivityTimeline';
import TimeLogCalendar from '../TimeLog/TimeLogCalendar';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileData, tasksData, projectsData] = await Promise.all([
          getUserProfile(),
          getRecentTasks(),
          getRecentProjects()
        ]);
        setProfile(profileData);
        setRecentTasks(tasksData);
        setRecentProjects(projectsData);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Failed to load profile</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Profile Info" />
        <Tab label="Time Logs" />
        {/* Other tabs */}
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Profile Overview */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                src={profile.avatar_url}
                alt={profile.name}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  margin: '0 auto',
                  mb: 2,
                  fontSize: '3rem'
                }}
              >
                {profile.name?.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {profile.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {profile.job_title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile.department}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{profile.email}</Typography>
                </Box>
                {profile.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{profile.phone}</Typography>
                  </Box>
                )}
                {profile.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{profile.location}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <JoinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Joined {new Date(profile.created_on).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box>
                  <Typography variant="h6">{profile.total_tasks}</Typography>
                  <Typography variant="body2" color="text.secondary">Tasks</Typography>
                </Box>
                <Box>
                  <Typography variant="h6">{profile.total_projects}</Typography>
                  <Typography variant="body2" color="text.secondary">Projects</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Skills/Expertise */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>Skills & Expertise</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.skills?.map((skill) => (
                  <Chip 
                    key={skill} 
                    label={skill} 
                    variant="outlined" 
                    size="small" 
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Recent Tasks */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TaskIcon sx={{ mr: 1 }} />
                Recent Tasks
              </Typography>
              <TaskList tasks={recentTasks} />
            </Paper>

            {/* Recent Projects */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ProjectIcon sx={{ mr: 1 }} />
                Recent Projects
              </Typography>
              <ProjectList projects={recentProjects} />
            </Paper>

            {/* Activity Timeline */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Recent Activity</Typography>
              <ActivityTimeline activities={profile.recent_activities} />
            </Paper>
          </Grid>
        </Grid>
      )}
      {activeTab === 1 && (
        <TimeLogCalendar />
      )}
      {/* Other tab panels */}
    </Box>
  );
};

export default Profile; 