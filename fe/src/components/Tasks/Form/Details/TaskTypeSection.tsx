import React from 'react';
import { Box, Typography } from '@mui/material';
import TaskTypeSelect from '../../TaskTypeSelect';
import { TaskFormState } from '../../../../types/task';
import { FormChangeHandler } from '../types';

interface TaskTypeSectionProps {
  formData: TaskFormState;
  handleChange: FormChangeHandler;
}

export const TaskTypeSection: React.FC<TaskTypeSectionProps> = ({
  formData,
  handleChange
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle1" sx={{ mb: 1 }}>Task Type</Typography>
    <TaskTypeSelect
      value={formData.type_id}
      onChange={(e) => handleChange({
        target: { name: 'type_id', value: e.target.value }
      })}
      required
    />
  </Box>
);
