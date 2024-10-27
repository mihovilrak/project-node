// src/components/Projects/Projects.js
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
  MenuItem
} from '@mui/material';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [sortOrder]);

  const fetchProjects = async () => {
    try {
      const projectList = await getProjects();
      setProjects(projectList);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects', error);
      throw error;
    }
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const filteredProjects = projects
    .filter((project) => project.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => (sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));

  if (loading) return <Typography>Loading projects...</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Projects</Typography>
      
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label="Filter by Name"
          variant="outlined"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Select value={sortOrder} onChange={handleSortChange} displayEmpty>
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={handleCreateProject} sx={{ ml: 'auto' }}>
          Create New Project
        </Button>
      </Box>

      {filteredProjects.length === 0 ? (
        <Typography>No projects yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card onClick={() => navigate(`/projects/${project.id}`)} sx={{ cursor: 'pointer' }}>
                <CardContent>
                  <Typography variant="h6">{project.name}</Typography>
                  <Typography variant="body2">{project.description}</Typography>
                  <Typography variant="caption">Due: {new Date(project.due_date).toLocaleDateString()}</Typography>
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
