import React from 'react';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { DatePickerSectionProps } from '../../../types/task';

export const DatePickerSection: React.FC<DatePickerSectionProps> = ({ formData, handleChange }) => {
  const datePickerStyle = {
    width: '100%'
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DatePicker
          label="Start Date"
          value={formData.start_date ? dayjs(formData.start_date) : null}
          onChange={(newValue) => handleChange({
            target: { name: 'start_date', value: newValue ? newValue.toISOString() : '' }
          })}
          sx={datePickerStyle}
          slotProps={{
            textField: {
              fullWidth: true,
              required: true
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DatePicker
          label="Due Date"
          value={formData.due_date ? dayjs(formData.due_date) : null}
          onChange={(newValue) => handleChange({
            target: { name: 'due_date', value: newValue ? newValue.toISOString() : '' }
          })}
          sx={datePickerStyle}
          slotProps={{
            textField: {
              fullWidth: true,
              required: true
            }
          }}
        />
      </Grid>
    </Grid>
  );
};
