import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getProjects } from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import { getUsers } from '../../api/users';
import { getActivityTypes } from '../../api/admin';
import { Project } from '../../types/project';
import { Task } from '../../types/task';
import { User } from '../../types/user';
import {
  ActivityType,
  TimeLogDialogProps,
  TimeLogCreate
} from '../../types/timeLog';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';

const TimeLogDialog: React.FC<TimeLogDialogProps> = ({
  open,
  projectId,
  taskId,
  timeLog,
  onClose,
  onSubmit
}) => {
  const { currentUser, hasPermission } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projectId || null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(taskId || null);
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUser?.id || 0);
  const [selectedActivityTypeId, setSelectedActivityTypeId] = useState<number>(0);
  const [spentTime, setSpentTime] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logDate, setLogDate] = useState<Dayjs>(timeLog ? dayjs(timeLog.log_date) : dayjs());
  const [timeError, setTimeError] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      const [projectsData, activityTypesData] = await Promise.all([
        getProjects(),
        getActivityTypes()
      ]);
      setProjects(projectsData);
      setActivityTypes(activityTypesData);

      if (hasPermission('Admin') || hasPermission('Project Manager')) {
        const usersData = await getUsers();
        setUsers(usersData);
      }

      if (projectId) {
        const projectTasks = await getProjectTasks(projectId);
        setTasks(projectTasks);
      }
    };

    loadInitialData();
  }, [projectId, hasPermission]);

  useEffect(() => {
    if (open && timeLog) {
      setSelectedProjectId(projectId || null);
      setSelectedTaskId(timeLog.task_id);
      setSelectedUserId(timeLog.user_id);
      setSelectedActivityTypeId(timeLog.activity_type_id);
      setSpentTime(String(timeLog.spent_time / 60));
      setDescription(timeLog.description || '');
      setLogDate(dayjs(timeLog.log_date));
    } else if (open) {
      setSelectedProjectId(projectId || null);
      setSelectedTaskId(taskId || null);
      setSelectedUserId(currentUser?.id || 0);
      setSelectedActivityTypeId(0);
      setSpentTime('');
      setDescription('');
      setLogDate(dayjs());
    }
  }, [open, timeLog, projectId, taskId, currentUser]);

  const handleProjectChange = async (projectId: number) => {
    setSelectedProjectId(projectId);
    const projectTasks = await getProjectTasks(projectId);
    setTasks(projectTasks);
    if (!selectedTaskId || !projectTasks.find(t => t.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  };

  const handleTaskChange = (taskId: number) => {
    setSelectedTaskId(taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task && !selectedProjectId) {
      setSelectedProjectId(task.project_id);
    }
  };

  const validateAndFormatTime = (timeStr: string): number | null => {
    // Clear previous error
    setTimeError('');

    // Check HH:MM or HH:MM:SS format
    const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    if (timePattern.test(timeStr)) {
      const [hours, minutes] = timeStr.split(':');
      // Convert to total minutes
      return parseInt(hours) * 60 + parseInt(minutes);
    }

    // Check decimal hours (e.g., 1.5)
    const decimalHours = parseFloat(timeStr);
    if (!isNaN(decimalHours) && decimalHours > 0) {
      // Convert hours to minutes
      return Math.round(decimalHours * 60);
    }

    setTimeError('Invalid time format. Use HH:MM or decimal hours (e.g., 1.5)');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !selectedActivityTypeId) return;

    const timeInMinutes = validateAndFormatTime(spentTime);
    if (timeInMinutes === null) return; // Invalid time format

    try {
      const timeLogData: TimeLogCreate = {
        task_id: selectedTaskId,
        user_id: selectedUserId,
        activity_type_id: selectedActivityTypeId,
        log_date: logDate.format('YYYY-MM-DD'),
        spent_time: timeInMinutes,
        description: description || undefined
      };

      await onSubmit(timeLogData);
      onClose();
    } catch (error) {
      console.error('Failed to submit time log:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{timeLog ? 'Edit Time Log' : 'Log Time'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <DatePicker
              label="Log Date"
              value={logDate}
              onChange={(newValue) => setLogDate(newValue || dayjs())}
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  required: true
                } 
              }}
            />

            {(hasPermission('Admin') || hasPermission('Project Manager')) && (
              <FormControl fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value as number)}
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
                onChange={(e) => handleProjectChange(e.target.value as number)}
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
                onChange={(e) => handleTaskChange(e.target.value as number)}
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
              onChange={(e) => setSpentTime(e.target.value)}
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
                onChange={(e) => setSelectedActivityTypeId(e.target.value as number)}
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
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {timeLog ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TimeLogDialog;