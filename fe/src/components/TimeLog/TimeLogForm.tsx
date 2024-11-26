import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { TimeLogFormProps } from '../../types/timeLog';

const TimeLogForm: React.FC<TimeLogFormProps> = ({
  spentTime,
  description,
  activityTypeId,
  activityTypes,
  onSpentTimeChange,
  onDescriptionChange,
  onActivityTypeChange,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Time Spent (minutes)"
        type="number"
        value={spentTime}
        onChange={(e) => onSpentTimeChange(parseInt(e.target.value) || 0)}
        fullWidth
        required
      />
      <FormControl fullWidth required>
        <InputLabel>Activity Type</InputLabel>
        <Select
          value={activityTypeId}
          onChange={(e) => onActivityTypeChange(e.target.value as number)}
          label="Activity Type"
        >
          {activityTypes.map((type) => (
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
        fullWidth
        required
      />
    </Box>
  );
};

export default TimeLogForm; 