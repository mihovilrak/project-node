import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  ViewState,
  EditingState,
  IntegratedEditing
} from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  WeekView,
  MonthView,
  Toolbar,
  DateNavigator,
  Appointments,
  AppointmentTooltip,
  ViewSwitcher,
  DragDropProvider
} from '@devexpress/dx-react-scheduler-material-ui';
import { getProjectTasks, updateTaskDates } from '../../api/tasks';
import { useAuth } from '../../context/AuthContext';

const ProjectGantt = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentViewName, setCurrentViewName] = useState('Month');
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await getProjectTasks(projectId);
      const formattedTasks = tasksData.map(task => ({
        id: task.id,
        title: task.name,
        startDate: new Date(task.start_date),
        endDate: new Date(task.due_date),
        assigneeId: task.assignee_id,
        type: task.type,
        priority: task.priority,
        status: task.status,
        progress: task.progress || 0,
        description: task.description,
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to load project tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdated = async ({ changed }) => {
    try {
      const taskId = Object.keys(changed)[0];
      const updatedTask = changed[taskId];
      
      if (updatedTask.startDate || updatedTask.endDate) {
        await updateTaskDates(taskId, {
          start_date: updatedTask.startDate,
          due_date: updatedTask.endDate
        });
        await fetchTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task dates');
    }
  };

  const Appointment = ({
    children,
    style,
    data,
    ...restProps
  }) => {
    const status = data.status.toLowerCase();
    const priority = data.priority.toLowerCase();
    
    const getStatusColor = () => {
      const colors = {
        'not started': theme.palette.grey[500],
        'in progress': theme.palette.primary.main,
        'completed': theme.palette.success.main,
        'blocked': theme.palette.error.main,
      };
      return colors[status] || theme.palette.grey[500];
    };

    const getPriorityColor = () => {
      const colors = {
        low: theme.palette.info.light,
        medium: theme.palette.warning.main,
        high: theme.palette.error.main,
      };
      return colors[priority] || theme.palette.grey[500];
    };

    return (
      <Appointments.Appointment
        {...restProps}
        style={{
          ...style,
          backgroundColor: getStatusColor(),
          borderLeft: `4px solid ${getPriorityColor()}`,
        }}
      >
        {children}
      </Appointments.Appointment>
    );
  };

  const AppointmentContent = ({
    children,
    style,
    data,
    ...restProps
  }) => (
    <Appointments.AppointmentContent
      {...restProps}
      style={style}
    >
      <Box sx={{ height: '100%', p: 0.5 }}>
        <Typography variant="subtitle2" noWrap>
          {data.title}
        </Typography>
        <Typography variant="caption" color="textSecondary" noWrap>
          {data.progress}% Complete
        </Typography>
      </Box>
    </Appointments.AppointmentContent>
  );

  const TooltipContent = ({
    children,
    appointmentData,
    ...restProps
  }) => (
    <AppointmentTooltip.Content
      {...restProps}
      appointmentData={appointmentData}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {appointmentData.title}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {appointmentData.description}
        </Typography>
        <Typography variant="body2">
          Status: {appointmentData.status}
        </Typography>
        <Typography variant="body2">
          Priority: {appointmentData.priority}
        </Typography>
        <Typography variant="body2">
          Progress: {appointmentData.progress}%
        </Typography>
      </Box>
    </AppointmentTooltip.Content>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ height: 'calc(100vh - 200px)' }}>
      <Scheduler
        data={tasks}
        height="100%"
      >
        <ViewState
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          currentViewName={currentViewName}
          onCurrentViewNameChange={setCurrentViewName}
        />
        <EditingState
          onCommitChanges={handleTaskUpdated}
        />
        <IntegratedEditing />

        <MonthView />
        <WeekView
          startDayHour={8}
          endDayHour={20}
        />

        <Toolbar />
        <DateNavigator />
        <ViewSwitcher />

        <Appointments
          appointmentComponent={Appointment}
          appointmentContentComponent={AppointmentContent}
        />
        <AppointmentTooltip
          contentComponent={TooltipContent}
          showCloseButton
        />
        <DragDropProvider />
      </Scheduler>
    </Paper>
  );
};

export default ProjectGantt; 