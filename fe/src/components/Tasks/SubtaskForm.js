import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { createSubtask } from '../../api/tasks';

const SubtaskForm = ({ open, onClose, parentTaskId, onSubtaskCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: null,
    due_date: null,
    priority: 'Normal',
    status: 'New'
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
      const newSubtask = await createSubtask(parentTaskId, formData);
      onSubtaskCreated(newSubtask);
      onClose();
      setFormData({
        name: '',
        description: '',
        start_date: null,
        due_date: null,
        priority: 'Normal',
        status: 'New'
      });
    } catch (error) {
      console.error('Failed to create subtask:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Subtask</DialogTitle>
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
              rows={3}
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

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Priority"
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Normal">Normal</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Review">Review</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Create Subtask
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubtaskForm; 