import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import * as Icons from '@mui/icons-material';

const TaskTypeSelect = ({ value, onChange, error, required }) => {
  const taskTypes = [
    { id: 1, name: 'Task', color: '#2196f3', icon: 'Assignment' },
    { id: 2, name: 'Bug', color: '#f44336', icon: 'BugReport' },
    { id: 3, name: 'Work Package', color: '#4caf50', icon: 'Work' },
    { id: 4, name: 'Code Review', color: '#9c27b0', icon: 'Code' },
    { id: 5, name: 'Feature', color: '#ff9800', icon: 'Stars' },
    { id: 6, name: 'Documentation', color: '#795548', icon: 'Description' },
    { id: 7, name: 'Testing', color: '#607d8b', icon: 'Science' },
    { id: 8, name: 'Research', color: '#673ab7', icon: 'Search' }
  ];

  return (
    <FormControl fullWidth error={error} required={required}>
      <InputLabel>Task Type</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        label="Task Type"
      >
        {taskTypes.map((type) => {
          const Icon = Icons[type.icon];
          return (
            <MenuItem key={type.id} value={type.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ color: type.color }} />
                {type.name}
              </Box>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default TaskTypeSelect; 