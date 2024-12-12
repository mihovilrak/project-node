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
import { TimeLogFormProps, ActivityType } from '../../types/timeLog';
import dayjs, { Dayjs } from 'dayjs';

interface ExtendedTimeLogFormProps extends TimeLogFormProps {
  activityTypes: ActivityType[];
}

const TimeLogForm: React.FC<ExtendedTimeLogFormProps> = ({
  projectId,
  taskId,
  onClose,
  onSubmit,
  activityTypes
}) => {
  const [spentTime, setSpentTime] = React.useState<number>(0);
  const [description, setDescription] = React.useState<string>('');
  const [activityTypeId, setActivityTypeId] = React.useState<number>(0);
  const [logDate, setLogDate] = React.useState<Dayjs>(dayjs());

  const handleSubmit = async () => {
    await onSubmit({
      task_id: taskId || 0,
      spent_time: spentTime,
      description,
      activity_type_id: activityTypeId,
      log_date: logDate.format('YYYY-MM-DD')
    });
    onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <DatePicker
        label="Log Date"
        value={logDate}
        onChange={(newValue: Dayjs | null) => setLogDate(newValue || dayjs())}
        slotProps={{ textField: { fullWidth: true } }}
      />
      <TextField
        label="Time Spent (minutes)"
        type="number"
        value={spentTime}
        onChange={(e) => setSpentTime(parseInt(e.target.value) || 0)}
        fullWidth
        required
      />
      <FormControl fullWidth required>
        <InputLabel>Activity Type</InputLabel>
        <Select
          value={activityTypeId}
          onChange={(e) => setActivityTypeId(e.target.value as number)}
          label="Activity Type"
        >
          {activityTypes.map((type: ActivityType) => (
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
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
      />
    </Box>
  );
};

export default TimeLogForm; 