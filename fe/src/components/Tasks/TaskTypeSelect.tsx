import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { TaskTypeSelectProps } from '../../types/task';
import { useLookup } from '../../context/LookupsContext';
import { getMuiIcon } from '../../utils/muiIcons';

const TaskTypeSelect: React.FC<TaskTypeSelectProps> = ({
  value,
  onChange,
  error,
  required,
}) => {
  const { data: taskTypes, loading } = useLookup('types');

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
        {!taskTypes || taskTypes.length === 0 ? (
          <MenuItem value="" disabled>
            No task types available
          </MenuItem>
        ) : (
          taskTypes.map((type) => {
            if (!type?.id) return null;
            const Icon = getMuiIcon(type?.icon);
            return (
              <MenuItem key={type.id} value={type.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {Icon && <Icon sx={{ color: type?.color || '#666' }} />}
                  <span style={{ color: type?.color || '#666' }}>
                    {type?.name || 'Unknown'}
                  </span>
                </Box>
              </MenuItem>
            );
          })
        )}
      </Select>
    </FormControl>
  );
};

export default TaskTypeSelect;
