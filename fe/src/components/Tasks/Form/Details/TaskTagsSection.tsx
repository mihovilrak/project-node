import React from 'react';
import { Box } from '@mui/material';
import TagSelect from '../../TagSelect';
import { TaskFormState } from '../../../../types/task';
import { Tag } from '../../../../types/tag';
import { FormChangeHandler } from '../types';

interface TaskTagsSectionProps {
  formData: TaskFormState;
  handleChange: FormChangeHandler;
}

export const TaskTagsSection: React.FC<TaskTagsSectionProps> = ({
  formData,
  handleChange
}) => (
  <Box sx={{ mb: 2 }}>
    <TagSelect
      selectedTags={formData.tags || []}
      onTagsChange={(newTags: Tag[]) => {
        handleChange({
          target: { name: 'tags', value: newTags }
        });
      }}
    />
  </Box>
);
