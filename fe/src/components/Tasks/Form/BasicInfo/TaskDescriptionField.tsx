import React from 'react';
import { TextField } from '@mui/material';
import { TaskFormState } from '../../../../types/task';

interface TaskDescriptionFieldProps {
  formData: TaskFormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TaskDescriptionField: React.FC<TaskDescriptionFieldProps> = ({ formData, handleChange }) => (
  <TextField 
    fullWidth 
    multiline 
    rows={4} 
    label="Description"
    name="description"
    value={formData.description || ''}
    onChange={handleChange}
    sx={{ mb: 2 }}
  />
);
