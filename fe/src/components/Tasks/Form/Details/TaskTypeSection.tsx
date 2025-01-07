import React from 'react';
import { Box } from '@mui/material';
import TaskTypeSelect from '../../TaskTypeSelect';
import { TaskTypeSectionProps } from '../../../../types/task';

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
