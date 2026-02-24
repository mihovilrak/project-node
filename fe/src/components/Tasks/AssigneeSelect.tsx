import React from 'react';
import {
  TextField,
  MenuItem
} from '@mui/material';
import { ProjectMember } from '../../types/project';
import { TaskFormState } from '../../types/task';

export const AssigneeSelect: React.FC<{
  label: string;
  name: string;
  projectMembers: ProjectMember[];
  formData: TaskFormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, projectMembers, formData, handleChange }) => {
  const raw = formData[name as keyof TaskFormState];
  const value = (name === 'holder_id' || name === 'assignee_id')
    ? (raw == null || raw === '' ? '' : (Number.isNaN(Number(raw)) ? '' : Number(raw)))
    : (raw ?? '');
  return (
  <TextField
    select
    fullWidth
    label={label}
    name={name}
    value={value}
    onChange={handleChange}
    sx={{ mb: 2 }}
  >
    <MenuItem value={0}>Unassigned</MenuItem>
    {(projectMembers || []).map((member) => {
      if (!member?.user_id) return null;
      return (
        <MenuItem key={member.user_id} value={member.user_id}>
          {`${member?.name || ''} ${member?.surname || ''}`.trim() || 'Unknown User'}
        </MenuItem>
      );
    })}
  </TextField>
  );
};
