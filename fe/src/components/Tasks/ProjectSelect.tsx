import React from 'react';
import {
  TextField,
  MenuItem
} from '@mui/material';
import { Project } from '../../types/project';
import { TaskFormState } from '../../types/task';

export const ProjectSelect: React.FC<{
  projects: Project[];
  formData: TaskFormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  projectIdFromQuery?: string | null;
}> = ({ projects, formData, handleChange, projectIdFromQuery }) => {
  // Ensure value is a number or empty string for proper display
  const selectValue = formData.project_id !== null && formData.project_id !== undefined 
    ? formData.project_id 
    : '';

  return (
    <TextField
      select
      fullWidth
      label="Project"
      name="project_id"
      value={selectValue}
      onChange={handleChange}
      required
      sx={{ mb: 2 }}
      disabled={!!projectIdFromQuery}
      data-testid="ProjectSelectFormControl"
      placeholder={formData.project_id ? undefined : "Select a project"}
    >
      {(!projects || projects.length === 0) ? (
        <MenuItem value="" disabled>
          No projects available
        </MenuItem>
      ) : (
        projects.map((project) => (
          <MenuItem key={project?.id} value={project?.id || ''}>
            {project?.name || 'Unknown Project'}
          </MenuItem>
        ))
      )}
    </TextField>
  );
};
