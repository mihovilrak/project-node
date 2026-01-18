import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { DatePickerSectionProps } from '../../../types/task';

export const DatePickerSection: React.FC<DatePickerSectionProps> = ({ formData, handleChange }) => {
  const datePickerStyle = {
    width: '100%',
    marginBottom: 2
  };

  return (
    <>
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
            required: true,
            sx: { mb: 2 }
          }
        }}
      />

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
            required: true,
            sx: { mb: 2 }
          }
        }}
      />
    </>
  );
};
