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

interface ProjectOverviewProps {
    project: Project | null;
    projectDetails: Project | null;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, projectDetails }) => {
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

            {projectDetails.parent_id && (
                <Grid item xs={12} sm={6}>
                    <Typography>
                        <strong>Parent Project:</strong>{' '}
                        <Link
                            component={RouterLink}
                            to={`/projects/${projectDetails.parent_id}`}
                            underline="hover"
                        >
                            {projectDetails.parent_name}
                        </Link>
                    </Typography>
                </Grid>
            )}
            
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
                    <strong>Time Spent:</strong> {projectDetails.spent_time} hours
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
};

export default ProjectOverview;