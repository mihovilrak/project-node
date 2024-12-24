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

  useEffect(() => {
    fetchProjects();
  }, [sortOrder]);

  const fetchProjects = async (): Promise<void> => {
    try {
      const projectList = await getProjects();
      setProjects(projectList);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects', error);
      throw error;
    }
  };

  const handleCreateProject = (): void => {
    navigate('/projects/new');
  };

  const handleSortChange = (event: SelectChangeEvent<'asc' | 'desc'>): void => {
    setSortOrder(event.target.value as 'asc' | 'desc');
  };

  const filteredProjects = projects
    .filter((project) => project.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => (sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));

  if (loading) return <Typography>Loading projects...</Typography>;

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Projects</Typography>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <TextField
            label="Filter by Name"
            variant="outlined"
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Select 
            value={sortOrder} 
            onChange={handleSortChange} 
            size="small"
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateProject}
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
          <Grid item xs={12} sm={6} lg={4} key={project.id}>
            <Card onClick={() => navigate(`/projects/${project.id}`)}>
              <CardContent>
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2">{project.description}</Typography>
                <Typography variant="caption">
                  Due: {new Date(project.due_date).toLocaleDateString()}
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
