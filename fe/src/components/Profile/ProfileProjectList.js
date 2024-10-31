import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProfileProjectList = ({ projects }) => {
  const navigate = useNavigate();

  if (!projects.length) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        No recent projects
      </Typography>
    );
  }

  return (
    <List>
      {projects.map((project) => (
        <ListItem
          key={project.id}
          button
          onClick={() => navigate(`/projects/${project.id}`)}
          sx={{ 
            mb: 1, 
            border: 1, 
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <ListItemText
            primary={project.name}
            secondary={
              <Box sx={{ mt: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip 
                    label={project.status} 
                    size="small"
                    color={project.status_color}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Due: {new Date(project.due_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {project.progress}%
                  </Typography>
                </Box>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ProfileProjectList; 