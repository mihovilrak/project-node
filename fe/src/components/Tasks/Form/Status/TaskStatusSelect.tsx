import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { TaskFormState, TaskStatus } from '../../../../types/task';

interface TaskStatusSelectProps {
  formData: TaskFormState;
  statuses: TaskStatus[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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
        {status.name}
      </MenuItem>
    ))}
  </TextField>
);
