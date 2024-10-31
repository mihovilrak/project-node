import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { createSubproject } from '../../api/projects';

const SubprojectForm = ({ open, onClose, parentId, onSubprojectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: null,
    due_date: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newSubproject = await createSubproject(parentId, formData);
      onSubprojectCreated(newSubproject);
      onClose();
    } catch (error) {
      console.error('Failed to create subproject:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Subproject</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
            <DatePicker
              label="Start Date"
              value={formData.start_date}
              onChange={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            <DatePicker
              label="Due Date"
              value={formData.due_date}
              onChange={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Create Subproject
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubprojectForm; 