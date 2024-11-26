import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Box,
  CircularProgress
} from '@mui/material';
import { ProfileProjectListProps } from '../../types/profile';

const ProfileProjectList: React.FC<ProfileProjectListProps> = ({ projects, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Active Projects
      </Typography>
      <List>
        {projects.map((project) => (
          <ListItem key={project.id} divider>
            <ListItemText
              primary={project.name}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Due: {new Date(project.due_date).toLocaleDateString()}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default ProfileProjectList; 