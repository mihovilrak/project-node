import React from 'react';
import { TextField } from '@mui/material';
import { TaskFormState } from '../../../../types/task';

interface EstimatedTimeFieldProps {
  formData: TaskFormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EstimatedTimeField: React.FC<EstimatedTimeFieldProps> = ({
  formData,
  handleChange
}) => (
  <TextField 
    fullWidth
    label="Estimated Time (hours)"
    name="estimated_time"
    type="number"
    value={formData.estimated_time}
    onChange={handleChange}
    inputProps={{ min: 0, step: 0.5 }}
    sx={{ mb: 2 }}
  />
);
