import React from 'react';
import { TextField } from '@mui/material';
import { TaskFormState } from '../../../../types/task';
import { FormChangeHandler } from '../types';

interface TaskNameFieldProps {
  formData: TaskFormState;
  handleChange: FormChangeHandler;
}

export const TaskNameField: React.FC<TaskNameFieldProps> = ({ formData, handleChange }) => {
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
      sx={{ mb: 2 }}
    />
  );
};
