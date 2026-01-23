import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { getTaskTypes } from '../../api/taskTypes';
import {
  TaskType,
  TaskTypeSelectProps,
} from '../../types/task';

const TaskTypeSelect: React.FC<TaskTypeSelectProps> = ({
  value,
  onChange,
  error,
  required,
}) => {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTaskTypes = async (): Promise<void> => {
      try {
        const types = await getTaskTypes();
        setTaskTypes(types);
      } catch (error) {
        console.error('Failed to fetch task types:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTaskTypes();
  }, []);

  const handleChange = (event: SelectChangeEvent<number>): void => {
    onChange(event);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={1}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <FormControl fullWidth error={error} required={required}>
      <InputLabel id="task-type-select-label">Task Type</InputLabel>
      <Select<number>
        labelId="task-type-select-label"
        value={value as number | ''}
        onChange={handleChange}
        label="Task Type"
      >
        {taskTypes.map((type) => {
          const Icon = type.icon ? Icons[type.icon as keyof typeof Icons] : null;
          return (
            <MenuItem key={type.id} value={type.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {Icon && <Icon sx={{ color: type.color }} />}
                <span style={{ color: type.color }}>{type.name}</span>
              </Box>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default TaskTypeSelect;
