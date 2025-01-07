import React from 'react';
import { TextField } from '@mui/material';
import { TaskProgressFieldProps } from '../../../../types/task';

export const TaskProgressField: React.FC<TaskProgressFieldProps> = ({
  value,
  handleChange
}) => {
  return (
    <TextField
      fullWidth
      type="number"
      label="Progress (%)"
      name="progress"
      value={value}
      onChange={handleChange}
      inputProps={{
        min: 0,
        max: 100,
        step: 1
      }}
      sx={{ mb: 2 }}
    />
  );
};
