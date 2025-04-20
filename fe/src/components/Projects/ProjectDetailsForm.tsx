import React from 'react';
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { ProjectDetailsFormProps } from '../../types/project';

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  formData,
  errors,
  dateError,
  availableProjects,
  parentId,
  handleChange,
  handleStatusChange,
  handleDateChange,
  handleParentChange,
  handleCancel,
  onSubmit
}) => {
  return (
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
            value={formData.description || ''}
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
              onChange={handleParentChange}
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
          <Button 
            onClick={handleCancel} 
            color="inherit"
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            variant="contained" 
            color="primary"
            data-testid="next-button"
          >
            Next
          </Button>
        </Box>
      </Grid>
    </>
  );
};

export default ProjectDetailsForm;
