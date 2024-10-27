// src/components/Projects/NewProject.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../../api/projects';
import { Box, TextField, Button, Typography } from '@mui/material';

const NewProject = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    start_date: '',
    due_date: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject(formValues);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Create a New Project</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Project Name"
          name="name"
          fullWidth
          margin="normal"
          required
          value={formValues.name}
          onChange={handleInputChange}
        />
        <TextField
          label="Description"
          name="description"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={formValues.description}
          onChange={handleInputChange}
        />
        <TextField
          label="Start Date"
          name="start_date"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={formValues.start_date}
          onChange={handleInputChange}
        />
        <TextField
          label="Due Date"
          name="due_date"
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
          value={formValues.due_date}
          onChange={handleInputChange}
        />
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary">Save Project</Button>
          <Button variant="outlined" color="secondary" sx={{ ml: 2 }} onClick={() => navigate('/projects')}>Cancel</Button>
        </Box>
      </form>
    </Box>
  );
};

export default NewProject;
