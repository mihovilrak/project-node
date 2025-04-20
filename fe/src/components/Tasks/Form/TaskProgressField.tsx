import React from 'react';
import { TextField } from '@mui/material';
import { TaskProgressFieldProps } from '../../../types/task';

export const TaskProgressField: React.FC<TaskProgressFieldProps> = ({
  value,
  handleChange
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange({
      target: {
        name: e.target.name,
        value: e.target.value
      }
    });
  };

  return (
    <TextField
      fullWidth
      type="number"
      label="Progress (%)"
      name="progress"
      value={value}
      onChange={handleInputChange}
      inputProps={{
        min: 0,
        max: 100,
        step: 1
      }}
      sx={{ mb: 2 }}
    />
  );
};
