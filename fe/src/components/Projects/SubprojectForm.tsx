import React, { useState } from 'react';
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
import {
  SubprojectFormProps,
  SubprojectFormData
} from '../../types/project';
import { DatePicker } from '@mui/x-date-pickers';

const SubprojectForm: React.FC<SubprojectFormProps> = ({
  projectId,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState<SubprojectFormData>({
    name: '',
    description: '',
    start_date: null,
    due_date: null
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.due_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date.toISOString().split('T')[0],
        due_date: formData.due_date.toISOString().split('T')[0]
      });
      onClose();
    } catch (error) {
      setError('Failed to create subproject');
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Subproject</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({
                  ...formData,
                  name: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({
                  ...formData,
                  description: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formData.start_date}
                onChange={(date) => setFormData({
                  ...formData,
                  start_date: date
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Due Date"
                value={formData.due_date}
                onChange={(date) => setFormData({
                  ...formData,
                  due_date: date
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubprojectForm;
