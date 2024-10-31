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
  Box
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { createTimeLog } from '../../api/timeLogs';
import { getAllActivityTypes } from '../../api/activityTypes';

const TimeLogDialog = ({ open, onClose, taskId, onTimeLogCreated }) => {
  const [formData, setFormData] = useState({
    start_time: null,
    end_time: null,
    description: '',
    activity_type_id: null
  });
  const [error, setError] = useState(null);
  const [activityTypes, setActivityTypes] = useState([]);

  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const types = await getAllActivityTypes();
        setActivityTypes(types.filter(type => type.is_active));
      } catch (error) {
        console.error('Failed to fetch activity types:', error);
      }
    };
    fetchActivityTypes();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.start_time || !formData.end_time) {
      setError('Start time and end time are required');
      return false;
    }

    if (formData.start_time >= formData.end_time) {
      setError('End time must be after start time');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await createTimeLog(taskId, {
        ...formData,
        start_time: formData.start_time.toISOString(),
        end_time: formData.end_time.toISOString()
      });
      onTimeLogCreated();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create time log');
      console.error('Failed to create time log:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      start_time: null,
      end_time: null,
      description: '',
      activity_type_id: null
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Log Time</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Start Time"
                value={formData.start_time}
                onChange={(value) => handleChange('start_time', value)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="End Time"
                value={formData.end_time}
                onChange={(value) => handleChange('end_time', value)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Activity Type</InputLabel>
                <Select
                  value={formData.activity_type_id}
                  onChange={(e) => handleChange('activity_type_id', e.target.value)}
                  label="Activity Type"
                >
                  {activityTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: type.color
                          }}
                        />
                        {type.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                fullWidth
                required
                placeholder="Describe the work done..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Log Time
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TimeLogDialog; 