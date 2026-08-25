import React from 'react';
import { TextField } from '@mui/material';
import { TaskNameFieldProps } from '../../../types/task';

export const TaskNameField: React.FC<TaskNameFieldProps> = ({ formData, handleChange, error, helperText }) => {
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
      label="Name"
      name="name"
      value={formData.name}
      onChange={handleInputChange}
      required
      error={error}
      helperText={helperText}
      sx={{ mb: 2 }}
    />
  );
};
