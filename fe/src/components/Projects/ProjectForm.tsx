import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { createProject } from '../../api/projects';
import { ProjectFormProps, Project } from '../../types/project';

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Project>>({
    name: project?.name || '',
    description: project?.description || '',
    start_date: project?.start_date || new Date().toISOString(),
    due_date: project?.due_date || new Date().toISOString(),
    status_id: project?.status_id || 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    setFormData(prev => ({
      ...prev,
      status_id: event.target.value as number
    }));
  };

  const handleDateChange = (field: 'start_date' | 'due_date', date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date.toISOString()
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        await createProject(formData);
        navigate('/projects');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to create project. Please try again.'
      }));
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {project ? 'Edit Project' : 'Create New Project'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Start Date"
              value={new Date(formData.start_date || '')}
              onChange={(date) => handleDateChange('start_date', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.start_date,
                  helperText: errors.start_date
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Due Date"
              value={new Date(formData.due_date || '')}
              onChange={(date) => handleDateChange('due_date', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.due_date,
                  helperText: errors.due_date
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status_id}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={2}>On Hold</MenuItem>
                <MenuItem value={3}>Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {errors.submit && (
            <Grid item xs={12}>
              <Typography color="error">{errors.submit}</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                {project ? 'Save Changes' : 'Create Project'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProjectForm; 