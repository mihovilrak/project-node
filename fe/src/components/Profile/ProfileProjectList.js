import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ProfileProjectList = ({ projects, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Projects</Typography>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={60} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (!projects?.length) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Projects</Typography>
        <Typography color="text.secondary">No recent projects found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Recent Projects</Typography>
      <List>
        {projects.map((project) => (
          <ListItem
            key={project.id}
            sx={{
              mb: 1,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{project.name}</Typography>
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Due: {format(new Date(project.due_date), 'MMM dd, yyyy')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      sx={{ flexGrow: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {project.progress}%
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

ProfileProjectList.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    due_date: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired
  })),
  loading: PropTypes.bool
};

export default ProfileProjectList; 