// src/components/Projects/ProjectDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, updateProject, deleteProject } from '../../api/projects';
import { Box, Typography, TextField, Button } from '@mui/material';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(id);
        setProject(data);
      } catch (error) {
        console.error('Failed to fetch project details', error);
      }
    };

    fetchProject();
  }, [id]);

  const handleEditToggle = () => setEditMode(!editMode);

  const handleSave = async () => {
    try {
      await updateProject(id, project);
      setEditMode(false);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to update project', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        navigate('/projects');
      } catch (error) {
        console.error('Failed to delete project', error);
      }
    }
  };

  if (!project) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>{editMode ? 'Edit Project' : project.name}</Typography>

      {editMode ? (
        <>
          <TextField
            label="Project Name"
            fullWidth
            margin="normal"
            value={project.name}
            onChange={(e) => setProject({ ...project, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={project.description}
            onChange={(e) => setProject({ ...project, description: e.target.value })}
          />
          <Box mt={2}>
            <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
            <Button onClick={() => setEditMode(false)} variant="outlined" color="secondary" sx={{ ml: 2 }}>Cancel</Button>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="body1" gutterBottom>{project.description}</Typography>
          <Typography variant="body2" gutterBottom>Start Date: {new Date(project.start_date).toLocaleDateString()}</Typography>
          <Typography variant="body2" gutterBottom>Due Date: {new Date(project.due_date).toLocaleDateString()}</Typography>
          <Box mt={2}>
            <Button onClick={handleEditToggle} variant="contained" color="warning">Edit</Button>
            <Button onClick={handleDelete} variant="contained" color="error" sx={{ ml: 2 }}>Delete</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProjectDetail;
