import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { TaskFormState } from '../../../../types/task';
import { Task } from '../../../../types/task';

interface ParentTaskSelectProps {
  formData: TaskFormState;
  projectTasks: Task[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parentIdFromUrl?: string | null;
}

export const ParentTaskSelect: React.FC<ParentTaskSelectProps> = ({
  formData,
  projectTasks,
  handleChange,
  parentIdFromUrl
}) => (
  formData.project_id ? (
    <TextField 
      select 
      fullWidth 
      label="Parent Task" 
      name="parent_id" 
      value={formData.parent_id || ''} 
      onChange={handleChange}
      disabled={Boolean(parentIdFromUrl)}
      sx={{ mb: 2 }}
    >
      <MenuItem value="">None</MenuItem>
      {projectTasks.map((task) => (
        <MenuItem key={task.id} value={task.id}>
          {task.name}
        </MenuItem>
      ))}
    </TextField>
  ) : null
);
