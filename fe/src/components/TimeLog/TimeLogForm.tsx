import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { TimeLogFormProps } from '../../types/timeLog';

const TimeLogForm: React.FC<TimeLogFormProps> = ({
  selectedProjectId,
  selectedTaskId,
  selectedUserId,
  selectedActivityTypeId,
  spentTime,
  description,
  logDate,
  timeError,
  projects,
  tasks,
  users,
  activityTypes,
  showUserSelect,
  onProjectChange,
  onTaskChange,
  onUserChange,
  onActivityTypeChange,
  onSpentTimeChange,
  onDescriptionChange,
  onDateChange,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <DatePicker
        label="Log Date"
        value={logDate}
        onChange={onDateChange}
        slotProps={{ 
          textField: { 
            fullWidth: true,
            required: true
          } 
        }}
      />

      {showUserSelect && (
        <FormControl fullWidth>
          <InputLabel>User</InputLabel>
          <Select
            value={selectedUserId}
            onChange={(e) => onUserChange(e.target.value as number)}
          >
            {users.map(user => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <FormControl fullWidth>
        <InputLabel>Project</InputLabel>
        <Select
          value={selectedProjectId || ''}
          onChange={(e) => onProjectChange(e.target.value as number || null)}
        >
          {projects.map(project => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Task</InputLabel>
        <Select
          value={selectedTaskId || ''}
          onChange={(e) => onTaskChange(e.target.value as number || null, tasks)}
        >
          {tasks.map(task => (
            <MenuItem key={task.id} value={task.id}>
              {task.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Time Spent"
        value={spentTime}
        onChange={(e) => onSpentTimeChange(e.target.value)}
        fullWidth
        required
        error={!!timeError}
        helperText={timeError || 'Enter time as HH:MM or decimal hours (e.g., 1:30 or 1.5)'}
        sx={{ mt: 2 }}
      />

      <FormControl fullWidth>
        <InputLabel>Activity Type</InputLabel>
        <Select
          value={selectedActivityTypeId}
          onChange={(e) => onActivityTypeChange(e.target.value as number)}
        >
          {activityTypes.map(type => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Description"
        multiline
        rows={4}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
    </Box>
  );
};

export default TimeLogForm;
