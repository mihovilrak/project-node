import React, { useMemo } from 'react';
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { ProjectDetailsFormProps } from '../../types/project';

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = React.memo(({
  formData,
  errors,
  dateError,
  availableProjects,
  parentId,
  statuses = [],
  statusesLoading = false,
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
        <Grid size={{ xs: 12 }}>
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

        <Grid size={{ xs: 12 }}>
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

        <Grid size={{ xs: 12, sm: 6 }}>
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

        <Grid size={{ xs: 12, sm: 6 }}>
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

        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status_id}
              label="Status"
              onChange={handleStatusChange}
              disabled={statusesLoading}
            >
              {statusesLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading statuses...
                </MenuItem>
              ) : (!statuses || statuses.length === 0) ? (
                <MenuItem disabled>No statuses available</MenuItem>
              ) : (
                statuses.map((status) => {
                  if (!status?.id) return null;
                  return (
                    <MenuItem key={status.id} value={status.id}>
                      {status?.name || 'Unknown'}
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
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
              {(!availableProjects || availableProjects.length === 0) ? (
                <MenuItem value="" disabled>
                  No projects available
                </MenuItem>
              ) : (
                availableProjects.map(p => {
                  if (!p?.id) return null;
                  return (
                    <MenuItem key={p.id} value={p.id}>
                      {p?.name || 'Unnamed Project'}
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>
        </Grid>

        {dateError && (
          <Grid size={{ xs: 12 }}>
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
});

ProjectDetailsForm.displayName = 'ProjectDetailsForm';

export default ProjectDetailsForm;
