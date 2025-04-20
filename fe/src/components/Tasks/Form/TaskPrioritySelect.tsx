import React from 'react';
import { TextField, MenuItem } from '@mui/material';
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
        {priority.name}
      </MenuItem>
    ))}
  </TextField>
);
