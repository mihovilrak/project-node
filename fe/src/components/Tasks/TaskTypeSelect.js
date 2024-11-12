import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { getTaskTypes } from '../../api/taskTypes';

const TaskTypeSelect = ({ value, onChange, error, required }) => {
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskTypes = async () => {
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={1}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <FormControl fullWidth error={error} required={required}>
      <InputLabel>Task Type</InputLabel>
      <Select
        value={value || ''}
        onChange={onChange}
        label="Task Type"
      >
        {taskTypes.map((type) => {
          const Icon = Icons[type.icon];
          return (
            <MenuItem key={type.id} value={type.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {Icon && <Icon sx={{ color: type.color }} />}
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