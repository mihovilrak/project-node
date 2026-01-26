import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { ParentTaskSelectProps } from '../../../types/task';

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
      {(!projectTasks || projectTasks.length === 0) ? (
        <MenuItem value="" disabled>
          No tasks available
        </MenuItem>
      ) : (
        projectTasks.map((task) => {
          if (!task?.id) return null;
          return (
            <MenuItem key={task.id} value={task.id}>
              {task?.name || 'Unnamed Task'}
            </MenuItem>
          );
        })
      )}
    </TextField>
  ) : null
);
