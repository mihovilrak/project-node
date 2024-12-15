// fe/src/components/Projects/tabs/ProjectOverview.tsx
import React from 'react';
import {
    Grid,
    Typography,
    LinearProgress,
    List,
    ListItem,
    Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import { Project } from '../../../types/project';

const ProjectOverview: React.FC<Project> = (project: Project) => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <Typography variant="body1" paragraph>
        <strong>Description:</strong> {project.description || 'No description provided'}
      </Typography>
    </Grid>
    
    <Grid item xs={12} sm={6}>
      <Typography>
        <strong>Start Date:</strong>{' '}
        {format(new Date(project.start_date), 'dd/MM/yyyy')}
      </Typography>
    </Grid>
    
    <Grid item xs={12} sm={6}>
      <Typography>
        <strong>Due Date:</strong>{' '}
        {format(new Date(project.due_date), 'dd/MM/yyyy')}
      </Typography>
    </Grid>
    
    <Grid item xs={12} sm={6}>
      <Typography>
        <strong>Created By:</strong>{' '}
        {project.creator_name ? (
          <Link
            component={RouterLink}
            to={`/users/${project.created_by}`}
            underline="hover"
          >
            {project.creator_name}
          </Link>
        ) : 'Unknown'}
      </Typography>
    </Grid>
    
    <Grid item xs={12} sm={6}>
      <Typography>
        <strong>Created On:</strong>{' '}
        {format(new Date(project.created_on), 'dd/MM/yyyy')}
      </Typography>
    </Grid>
    
    <Grid item xs={12}>
      <Typography gutterBottom>
        <strong>Progress:</strong> {project.progress || 0}%
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={project.progress || 0}
        sx={{ height: 10, borderRadius: 1 }}
      />
    </Grid>
    
    <Grid item xs={12}>
      <Typography>
        <strong>Total Time Spent:</strong> {project.spent_time} hours
      </Typography>
    </Grid>
    
    <Grid item xs={12}>
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Subprojects
      </Typography>
      {project.subprojects && project.subprojects.length > 0 ? (
        <List>
          {project.subprojects.map((subproject) => (
            <ListItem key={subproject.id}>
              <Link 
                component={RouterLink} 
                to={`/projects/${subproject.id}`}
                underline="hover"
              >
                {subproject.name}
              </Link>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="textSecondary">
          No subprojects found
        </Typography>
      )}
    </Grid>
  </Grid>
);

export default ProjectOverview;