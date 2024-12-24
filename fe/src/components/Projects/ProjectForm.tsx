import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { createProject, addProjectMember, getProjects } from '../../api/projects';
import { getUsers } from '../../api/users';
import { ProjectFormProps, Project } from '../../types/project';
import ProjectMemberSelect from './ProjectMemberSelect';
import { User } from '../../types/user';

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const parentId = searchParams.get('parentId');
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [dateError, setDateError] = useState<string>('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await getProjects();
        setAvailableProjects(projects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const [formData, setFormData] = useState<Partial<Project>>({
    name: project?.name || '',
    description: project?.description || '',
    start_date: project?.start_date || new Date().toISOString(),
    due_date: project?.due_date || undefined,
    status_id: project?.status_id || 1,
    parent_id: project?.parent_id || (parentId ? parseInt(parentId) : null)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [memberError, setMemberError] = useState<string>('');
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

  const handleDateChange = (field: 'start_date' | 'due_date', newValue: dayjs.Dayjs | null) => {
    if (!newValue) {
      setFormData(prev => ({
        ...prev,
        [field]: ''
      }));
      return;
    }

    const value = newValue.format('YYYY-MM-DD');
    const startDate = field === 'start_date' ? new Date(value) : new Date(formData.start_date || '');
    const dueDate = field === 'due_date' ? new Date(value) : new Date(formData.due_date || '');

    if (field === 'due_date' && startDate > dueDate) {
      setDateError('Due date must be after start date');
      setTimeout(() => setDateError(''), 3000); // Message disappears after 3 seconds
      return;
    }
    
    setDateError('');
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

    // Validate that at least one member is selected
    if (selectedUsers.length === 0) {
      setMemberError('Please select at least one project member');
      return;
    }
    setMemberError('');

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
                  onChange={(newValue) => handleDateChange('start_date', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Due Date"
                  value={formData.due_date ? dayjs(formData.due_date) : null}
                  onChange={(newValue) => handleDateChange('due_date', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
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

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Parent Project</InputLabel>
                  <Select
                    value={formData.parent_id || ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      setFormData(prev => ({
                        ...prev,
                        parent_id: value
                      }));
                    }}
                    label="Parent Project"
                    disabled={!!parentId}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {availableProjects.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {dateError && (
                <Grid item xs={12}>
                  <Typography 
                    color="error" 
                    sx={{ 
                      mt: 1,
                      position: 'relative',
                      animation: 'fadeIn 0.3s ease-in'
                    }}
                  >
                    {dateError}
                  </Typography>
                </Grid>
              )}

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
            {memberError && (
              <Typography color="error" sx={{ mt: 1 }}>
                {memberError}
              </Typography>
            )}
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
