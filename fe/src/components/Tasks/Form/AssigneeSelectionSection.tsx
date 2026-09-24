import React from 'react';
import { Grid } from '@mui/material';
import { AssigneeSelect } from '../AssigneeSelect';
import { AssigneeSelectionSectionProps } from '../../../types/task';

/**
 * Render side-by-side dropdown selectors for task holder and assignee from available project members.
 * @param root0 Object containing form state, available project members, and change handler function
 */
export const AssigneeSelectionSection: React.FC<
  AssigneeSelectionSectionProps
> = ({ formData, projectMembers, handleChange }) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <AssigneeSelect
        label="Holder"
        name="holder_id"
        projectMembers={projectMembers}
        formData={formData}
        handleChange={handleChange}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <AssigneeSelect
        label="Assignee"
        name="assignee_id"
        projectMembers={projectMembers}
        formData={formData}
        handleChange={handleChange}
      />
    </Grid>
  </Grid>
);
