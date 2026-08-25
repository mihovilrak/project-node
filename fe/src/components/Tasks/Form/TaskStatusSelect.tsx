import React from 'react';
import { TextField, MenuItem, Box } from '@mui/material';
import { TaskStatusSelectProps } from '../../../types/task';

export const TaskStatusSelect: React.FC<TaskStatusSelectProps> = ({
  formData,
  statuses,
  handleChange
}) => (
  <TextField
    select
    fullWidth
    label="Status"
    name="status_id"
    value={formData.status_id}
    onChange={handleChange}
    required
    sx={{ mb: 2 }}
  >
    {statuses.map((status) => (
      <MenuItem key={status.id} value={status.id}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {status.color && (
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                backgroundColor: status.color,
                flexShrink: 0
              }}
            />
          )}
          {status.name}
        </Box>
      </MenuItem>
    ))}
  </TextField>
);
