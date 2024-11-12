import React, { useState, useEffect } from 'react';
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
import { getTaskStatuses, getPriorities } from '../../api/tasks';

const SubtaskForm = ({ open, onClose, parentTaskId, onSubtaskCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: parentTaskId,
    start_date: null,
    due_date: null,
    priority_id: 2,
    status_id: 1
  });

  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [statusesData, prioritiesData] = await Promise.all([
          getTaskStatuses(),
          getPriorities()
        ]);
        setStatuses(statusesData);
        setPriorities(prioritiesData);
        
        // Set default values
        setFormData(prev => ({
          ...prev,
          status_id: statusesData.find(s => s.status === 'New')?.id,
          priority_id: prioritiesData.find(p => p.priority === 'Normal')?.id
        }));
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };
    fetchOptions();
  }, []);

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
      const newSubtask = await createSubtask(parentTaskId, {
        ...formData,
        parent_id: parentTaskId
      });
      onSubtaskCreated(newSubtask);
      onClose();
      setFormData({
        name: '',
        description: '',
        parent_id: parentTaskId,
        start_date: null,
        due_date: null,
        priority_id: 2,
        status_id: 1
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
                name="priority_id"
                value={formData.priority_id}
                onChange={handleChange}
                label="Priority"
              >
                {priorities.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.priority}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status_id"
                value={formData.status_id}
                onChange={handleChange}
                label="Status"
              >
                {statuses.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.status}</MenuItem>
                ))}
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