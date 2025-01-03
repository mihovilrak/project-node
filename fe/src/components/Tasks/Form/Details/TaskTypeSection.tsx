import React from 'react';
import { Box } from '@mui/material';
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
    <TaskTypeSelect
      value={formData.type_id || 0}
      onChange={(e) => handleChange({
        target: { name: 'type_id', value: e.target.value }
      })}
      required
    />
  </Box>
);
