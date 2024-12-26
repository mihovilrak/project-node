import React from 'react';
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
  MenuItem
} from '@mui/material';
import { updateProject } from '../../api/projects';
import { ProjectEditDialogProps } from '../../types/project';
import { useProjectEdit } from '../../hooks/project/useProjectEdit';

const ProjectEditDialog: React.FC<ProjectEditDialogProps> = ({
  open,
  project,
  onClose,
  onSaved
}) => {
  const {
    formData,
    error,
    loading,
    statuses,
    setError,
    setLoading,
    handleTextChange,
    handleStatusChange
  } = useProjectEdit(project);

  const handleSubmit = async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (!project) return;

      const updatedProject = await updateProject(project.id, formData);
      onSaved(updatedProject);
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
