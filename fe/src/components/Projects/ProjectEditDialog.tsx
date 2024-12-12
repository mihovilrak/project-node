import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert
} from '@mui/material';
import { updateProject } from '../../api/projects';
import { ProjectEditDialogProps, Project } from '../../types/project';

interface FormData extends Partial<Project> {
  name: string;
  description: string | null;
  start_date: string;
  due_date: string;
}

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
    due_date: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        start_date: project.start_date,
        due_date: project.due_date
      });
    }
  }, [project]);

  const handleChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
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
              onChange={handleChange('name')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={formData.description || ''}
              onChange={handleChange('description')}
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
              onChange={handleChange('start_date')}
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
              onChange={handleChange('due_date')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
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