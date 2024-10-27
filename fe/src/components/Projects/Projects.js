import React, { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../../api/projects';
import { Grid, TextField, Button, Card, CardContent, Typography, Box } from '@mui/material';

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    start_date: '',
    due_date: '',
  });
  const [editingProjectId, setEditingProjectId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const projectList = await getProjects();
      setProjects(projectList);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  // Handle create or update project
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProjectId) {
        // If editing, update the project
        await updateProject(editingProjectId, formValues);
        console.log('Project updated successfully');
      } else {
        // If not editing, create a new project
        await createProject(formValues);
        console.log('Project created successfully');
      }
      fetchProjects(); // Refresh project list
      resetForm();
    } catch (error) {
      console.error('Failed to save project', error);
    }
  };

  // Handle delete project
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        console.log('Project deleted successfully');
        fetchProjects(); // Refresh project list
      } catch (error) {
        console.error('Failed to delete project', error);
      }
    }
  };

  // Set the form for editing a project
  const handleEdit = (project) => {
    setFormValues(project);
    setEditingProjectId(project.id);
  };

  // Reset the form
  const resetForm = () => {
    setFormValues({
      name: '',
      description: '',
      start_date: '',
      due_date: '',
    });
    setEditingProjectId(null);
  };

  if (loading) {
    return <p>Loading projects...</p>;
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>

      {/* Project Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} marginBottom={4}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Project Name"
              name="name"
              value={formValues.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Project Description"
              name="description"
              value={formValues.description}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              name="start_date"
              value={formValues.start_date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              name="due_date"
              value={formValues.due_date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" color="primary">
          {editingProjectId ? 'Update Project' : 'Create Project'}
        </Button>
        {editingProjectId && (
          <Button onClick={resetForm} variant="contained" color="secondary" sx={{ ml: 2 }}>
            Cancel Edit
          </Button>
        )}
      </form>

      {/* Check if there are no projects */}
      {projects.length === 0 ? (
        <Typography variant="body1" marginTop={4}>
          No projects yet.
        </Typography>
      ) : (
        <Grid container spacing={4} marginTop={4}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{project.name}</Typography>
                  <Typography variant="body2">{project.description}</Typography>
                  <Typography variant="body2">
                    Start Date: {new Date(project.start_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Due Date: {new Date(project.due_date).toLocaleDateString()}
                  </Typography>
                  <Box marginTop={2}>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => handleEdit(project)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(project.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Project;
