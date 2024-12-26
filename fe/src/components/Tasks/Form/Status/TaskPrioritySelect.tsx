import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { TaskFormState, TaskPriority } from '../../../../types/task';

interface TaskPrioritySelectProps {
  formData: TaskFormState;
  priorities: TaskPriority[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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
    value={formData.priority_id} 
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
