import React from 'react';
import { TextField, MenuItem, Box } from '@mui/material';
import { TaskPrioritySelectProps } from '../../../types/task';

export const TaskPrioritySelect: React.FC<TaskPrioritySelectProps> = ({
  formData,
  priorities,
  handleChange
}) => (
  <TextField
    select
    fullWidth
    label="Priority"
    name="priority_id"
    value={formData.priority_id || ''}
    onChange={handleChange}
    required
    sx={{ mb: 2 }}
  >
    {priorities.map((priority) => (
      <MenuItem key={priority.id} value={priority.id}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {priority.color && (
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                backgroundColor: priority.color,
                flexShrink: 0
              }}
            />
          )}
          {priority.name}
        </Box>
      </MenuItem>
    ))}
  </TextField>
);
