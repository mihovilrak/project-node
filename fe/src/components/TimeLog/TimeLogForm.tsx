import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { TimeLogFormProps } from '../../types/timeLog';

const TimeLogForm: React.FC<TimeLogFormProps> = ({
  projects,
  tasks,
  activityTypes,
  users,
  selectedProjectId,
  selectedTaskId,
  selectedUserId,
  selectedActivityTypeId,
  spentTime,
  description,
  logDate,
  timeError,
  isProjectReadOnly,
  isTaskReadOnly,
  onProjectChange,
  onTaskChange,
  onUserChange,
  onActivityTypeChange,
  onSpentTimeChange,
  onDescriptionChange,
  onDateChange,
  showUserSelect,
}) => {
  const handleSpentTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);

    // Only allow numbers divisible by 0.25
    if (value === '' || (!isNaN(numValue) && numValue % 0.25 === 0)) {
      onSpentTimeChange(value);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      width: '100%'
    }}>
      <FormControl fullWidth disabled={isProjectReadOnly}>
        <InputLabel id="project-label">Project</InputLabel>
        <Select
          labelId="project-label"
          id="project-select"
          value={selectedProjectId?.toString() || ''}
          onChange={(e: SelectChangeEvent) => onProjectChange(Number(e.target.value), tasks)}
          label="Project"
          required
        >
          {projects.length === 0 ? (
            <MenuItem disabled>No projects available</MenuItem>
          ) : (
            projects.map(project => (
              <MenuItem key={project?.id} value={project?.id}>
                {project?.name || 'Unknown'}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={isTaskReadOnly}>
        <InputLabel id="task-label">Task</InputLabel>
        <Select
          labelId="task-label"
          id="task-select"
          value={selectedTaskId?.toString() || ''}
          onChange={(e: SelectChangeEvent) => onTaskChange(Number(e.target.value), tasks)}
          label="Task"
          required
        >
          {tasks.length === 0 ? (
            <MenuItem disabled>No tasks available</MenuItem>
          ) : (
            tasks.map(task => (
              <MenuItem key={task?.id} value={task?.id}>
                {task?.name || 'Unknown'}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="activity-type-label">Activity Type</InputLabel>
        <Select
          labelId="activity-type-label"
          id="activity-type-select"
          value={selectedActivityTypeId?.toString() || ''}
          onChange={(e: SelectChangeEvent) => onActivityTypeChange(Number(e.target.value))}
          label="Activity Type"
          required
        >
          {activityTypes.map(type => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {showUserSelect && (
        <FormControl fullWidth>
          <InputLabel id="user-label">User</InputLabel>
          <Select
            labelId="user-label"
            id="user-select"
            value={selectedUserId?.toString() || ''}
            onChange={(e: SelectChangeEvent) => onUserChange(Number(e.target.value))}
            label="User"
            required
          >
            {users.length === 0 ? (
              <MenuItem disabled>No users available</MenuItem>
            ) : (
              users.map(user => (
                <MenuItem key={user?.id} value={user?.id}>
                  {user?.name || 'Unknown'}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      )}

      <TextField
        type="number"
        label="Time Spent (hours)"
        value={spentTime}
        onChange={handleSpentTimeChange}
        error={Boolean(timeError)}
        helperText={timeError || "Enter time in hours (increments of 0.25)"}
        required
        inputProps={{
          step: 0.25,
          min: 0,
          max: 999.99,
          pattern: "^\\d*\\.?([0-9]{1,2})?$"
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        multiline
        rows={4}
        required
        sx={{ mb: 2 }}
      />

      <DatePicker
        label="Log Date"
        value={logDate}
        onChange={(newValue: Dayjs | null) => onDateChange(newValue)}
        slotProps={{
          textField: {
            fullWidth: true,
            required: true,
            sx: { mb: 2 }
          }
        }}
      />
    </Box>
  );
};

export default TimeLogForm;
