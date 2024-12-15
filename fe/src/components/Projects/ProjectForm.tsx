import React, { useState, useEffect } from 'react';
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
import dayjs from 'dayjs';
import { createProject, addProjectMember } from '../../api/projects';
import { getUsers } from '../../api/users';
import { ProjectFormProps, Project } from '../../types/project';
import ProjectMemberSelect from './ProjectMemberSelect';
import { User } from '../../types/user';

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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [step, setStep] = useState<'details' | 'members'>('details');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

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

  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'details') {
      if (validateForm()) {
        setStep('members');
      }
      return;
    }

    try {
      const projectData = { ...formData };
      const response = await createProject(projectData);
      
      // Add selected members to the project
      await Promise.all(
        selectedUsers.map(userId => addProjectMember(response.id, userId))
      );

      if (onSubmit) {
        onSubmit(response);
      }
      navigate(`/projects/${response.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/projects');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        {step === 'details' ? (
          <>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
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
                  value={formData.start_date ? dayjs(formData.start_date) : null}
                  onChange={(newValue) => handleDateChange('start_date', newValue ? newValue.toDate() : null)}
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
                  value={formData.due_date ? dayjs(formData.due_date) : null}
                  onChange={(newValue) => handleDateChange('due_date', newValue ? newValue.toDate() : null)}
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

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={handleCancel} color="inherit">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Next
                </Button>
              </Box>
            </Grid>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Project Members
            </Typography>
            <ProjectMemberSelect
              users={users}
              selectedUsers={selectedUsers}
              onUserSelect={handleUserSelect}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setStep('details')} color="inherit">
                Back
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Create Project
              </Button>
            </Box>
          </>
        )}
      </form>
    </Paper>
  );
};

export default ProjectForm;