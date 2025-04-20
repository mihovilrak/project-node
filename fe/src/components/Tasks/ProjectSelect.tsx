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
}> = ({ projects, formData, handleChange, projectIdFromQuery }) => (
  <TextField 
    select 
    fullWidth 
    label="Project" 
    name="project_id" 
    value={formData.project_id} 
    onChange={handleChange} 
    required 
    sx={{ mb: 2 }}
    disabled={!!projectIdFromQuery}
    data-testid="ProjectSelectFormControl"
  >
    {projects.map((project) => (
      <MenuItem key={project.id} value={project.id}>
        {project.name}
      </MenuItem>
    ))}
  </TextField>
);
