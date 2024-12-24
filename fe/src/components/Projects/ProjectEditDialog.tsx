import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { updateProject, getProjectStatuses } from '../../api/projects';
import { ProjectEditDialogProps, FormData } from '../../types/project';

const ProjectEditDialog: React.FC<ProjectEditDialogProps> = ({
  open,
  project,
  onClose,
  onSaved
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: null,
    start_date: '',
    due_date: '',
    status_id: 1
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statusList = await getProjectStatuses();
        setStatuses(statusList);
      } catch (err) {
        console.error('Failed to fetch project statuses:', err);
        setError('Failed to load project statuses');
      }
    };
    fetchStatuses();
  }, []);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        start_date: project.start_date.split('T')[0],
        due_date: project.due_date.split('T')[0],
        status_id: project.status_id
      });
    }
  }, [project]);

  const handleTextChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    
    if (field === 'start_date' || field === 'due_date') {
      const startDate = field === 'start_date' ? new Date(value) : new Date(formData.start_date);
      const dueDate = field === 'due_date' ? new Date(value) : new Date(formData.due_date);
      
      if (field === 'due_date' && startDate > dueDate) {
        return; // Don't update if due date is before start date
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    setFormData(prev => ({
      ...prev,
      status_id: event.target.value as number
    }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (!project) return;

      await updateProject(project.id, formData);
      onSaved();
      onClose();
    } catch (err) {
      setError('Failed to update project');
      console.error('Error updating project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Project</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={handleTextChange('name')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={formData.description || ''}
              onChange={handleTextChange('description')}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={handleTextChange('start_date')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={handleTextChange('due_date')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
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
                {statuses.map(status => (
                  <MenuItem key={status.id} value={status.id}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectEditDialog;
