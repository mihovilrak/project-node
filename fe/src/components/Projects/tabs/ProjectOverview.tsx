// fe/src/components/Projects/tabs/ProjectOverview.tsx
import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  LinearProgress,
  List,
  ListItem,
  Link
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ProjectOverviewProps, Project } from '../../../types/project';
import PermissionButton from '../../common/PermissionButton';
import { getSubprojects } from '../../../api/projects';

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, projectDetails }) => {
  const navigate = useNavigate();
  const [subprojects, setSubprojects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchSubprojects = async () => {
      if (project?.id) {
        try {
          const data = await getSubprojects(project.id);
          setSubprojects(data);
        } catch (error) {
          console.error('Failed to fetch subprojects:', error);
        }
      }
    };
    fetchSubprojects();
  }, [project?.id]);

  const handleAddSubproject = () => {
    if (project?.id) {
      navigate(`/projects/new?parentId=${project.id}`);
    }
  };

  if (!project || !projectDetails) {
    return <Typography>Loading project details...</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body1" paragraph>
          <strong>Description:</strong> {projectDetails.description || 'No description provided'}
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Typography>
          <strong>Start Date:</strong>{' '}
          {format(new Date(projectDetails.start_date), 'dd/MM/yyyy')}
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Typography>
          <strong>Due Date:</strong>{' '}
          {format(new Date(projectDetails.due_date), 'dd/MM/yyyy')}
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography>
          <strong>Status:</strong>{' '}
          {projectDetails.status_name}
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Typography>
          <strong>Parent Project:</strong>{' '}
          {projectDetails.parent_id ? (
            <Link
              component={RouterLink}
              to={`/projects/${projectDetails.parent_id}`}
              underline="hover"
            >
              {projectDetails.parent_name}
            </Link>
          ) : (
            'None'
          )}
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography>
          <strong>Created By:</strong>{' '}
          {projectDetails.created_by_name ? (
            <Link
              component={RouterLink}
              to={`/users/${projectDetails.created_by}`}
              underline="hover"
            >
              {projectDetails.created_by_name}
            </Link>
          ) : 'Unknown'}
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Typography>
          <strong>Created On:</strong>{' '}
          {format(new Date(projectDetails.created_on), 'dd/MM/yyyy')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography gutterBottom>
          <strong>Progress:</strong> {projectDetails.progress}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={projectDetails.progress}
          sx={{ height: 10, borderRadius: 1 }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Typography>
          <strong>Estimated Time:</strong> {projectDetails.estimated_time} hours
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Typography>
          <strong>Spent Time:</strong> {(projectDetails.spent_time / 60).toFixed(2)} hours
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Subprojects
        </Typography>
        {subprojects.length > 0 ? (
          <List>
            {subprojects.map((subproject) => (
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
        <PermissionButton
          requiredPermission="Create projects"
          variant="contained"
          color="primary"
          onClick={handleAddSubproject}
          sx={{ mt: 2 }}
        >
          Add Subproject
        </PermissionButton>
      </Grid>
    </Grid>
  );
};

export default ProjectOverview;
