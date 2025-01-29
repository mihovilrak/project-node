import React from 'react';
import { TextField } from '@mui/material';
import { EstimatedTimeFieldProps } from '../../../types/task';

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
