import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../api/projects';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Project } from '../../types/project';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [sortOrder]);

  const fetchProjects = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const projectList = await getProjects();
      setProjects(projectList || []);
    } catch (error: any) {
      console.error('Failed to fetch projects', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to load projects';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = (): void => {
    navigate('/projects/new');
  };

  const handleSortChange = (event: SelectChangeEvent<'asc' | 'desc'>): void => {
    setSortOrder(event.target.value as 'asc' | 'desc');
  };

  const filteredProjects = projects
    .filter((project) => project?.name?.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const nameA = a?.name || '';
      const nameB = b?.name || '';
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading projects...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" data-testid="projects-error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }} data-testid="projects-container">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Projects</Typography>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <TextField
            label="Filter by Name"
            variant="outlined"
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            data-testid="project-filter"
          />
          <Select
            value={sortOrder}
            onChange={handleSortChange}
            size="small"
            data-testid="project-sort"
            aria-label="Sort Order"
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateProject}
            data-testid="create-project-button"
          >
            Create New Project
          </Button>
        </Box>
      </Box>

      {filteredProjects.length === 0 ? (
        <Typography>No projects yet.</Typography>
      ) : (
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.id}>
            <Card
              onClick={() => navigate(`/projects/${project?.id}`)}
              data-testid={`project-card-${project?.id}`}
              role="button"
              aria-label={`View project ${project?.name || 'Unnamed'}`}
            >
              <CardContent>
                <Typography variant="h6">{project?.name || 'Unnamed Project'}</Typography>
                <Typography variant="body2">{project?.description || 'No description'}</Typography>
                <Typography variant="caption">
                  Due: {project?.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>
      )}
    </Box>
  );
};

export default Projects;
