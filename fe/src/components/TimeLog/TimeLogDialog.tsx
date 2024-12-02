import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  createTimeLog,
  updateTimeLog
} from '../../api/timeLogService';
import { TimeLog } from '../../types/timeLog';
import { useAuth } from '../../context/AuthContext';
import { getActivityTypes } from '../../api/admin';

export interface TimeLogDialogProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  taskId: number;
  timeLog: TimeLog | null;
}

const TimeLogDialog = ({
  open,
  onClose,
  taskId,
  timeLog
}: TimeLogDialogProps): JSX.Element => {
  const { currentUser } = useAuth();
  const [spentTime, setSpentTime] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [activityTypeId, setActivityTypeId] = useState<number>(0);
  const [activityTypes, setActivityTypes] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    const fetchActivityTypes = async () => {
      const types = await getActivityTypes();
      setActivityTypes(types);
      if (types.length > 0 && !activityTypeId) {
        setActivityTypeId(types[0].id);
      }
    };
    fetchActivityTypes();
  }, []);

  useEffect(() => {
    if (timeLog) {
      setSpentTime(timeLog.spent_time);
      setDescription(timeLog.description || '');
      setActivityTypeId(timeLog.activity_type_id);
    } else {
      setSpentTime(0);
      setDescription('');
      setActivityTypeId(activityTypes[0]?.id || 0);
    }
  }, [timeLog, activityTypes]);

  const handleSubmit = async () => {
    if (!taskId || !currentUser?.id) return;

    try {
      const timeLogData = {
        task_id: taskId,
        user_id: currentUser.id,
        spent_time: spentTime,
        description,
        activity_type_id: activityTypeId
      };

      if (timeLog) {
        await updateTimeLog(timeLog.id, timeLogData);
      } else {
        await createTimeLog(taskId, timeLogData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save time log:', error);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{timeLog ? 'Edit Time Log' : 'New Time Log'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Time Spent (minutes)"
            type="number"
            value={spentTime}
            onChange={(e) => setSpentTime(parseInt(e.target.value) || 0)}
          />
          <FormControl fullWidth>
            <InputLabel>Activity Type</InputLabel>
            <Select
              value={activityTypeId}
              onChange={(e) => setActivityTypeId(e.target.value as number)}
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
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {timeLog ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeLogDialog; 