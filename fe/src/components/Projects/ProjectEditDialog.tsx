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
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

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

      if (!project) {
        setError('Project is required');
        return;
      }

      const updatedProject = await updateProject(project.id, formData);
      onSaved(updatedProject);
      onClose();
    } catch (err: unknown) {
      logger.error('Error updating project:', err);
      setError(getApiErrorMessage(err, 'Failed to update project'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Project</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} data-testid="error-alert">
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleTextChange('name')}
              fullWidth
              required
              data-testid="project-name-input"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={handleTextChange('description')}
              fullWidth
              multiline
              rows={3}
              data-testid="project-description-input"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Start Date"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleTextChange('start_date')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              data-testid="project-start-date-input"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Due Date"
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleTextChange('due_date')}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              data-testid="project-due-date-input"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status_id}
                label="Status"
                name="status_id"
                onChange={handleStatusChange}
                data-testid="project-status-select"
              >
                {statuses.length === 0 ? (
                  <MenuItem disabled>No statuses available</MenuItem>
                ) : (
                  statuses.map(status => (
                    <MenuItem key={status?.id} value={status?.id}>
                      {status?.name || 'Unknown'}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} data-testid="cancel-button">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading} data-testid="save-button">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectEditDialog;
