import React from 'react';
import {
  Box,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ViewState,
  EditingState,
  IntegratedEditing,
  ChangeSet
} from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  DayView,
  WeekView,
  MonthView,
  Appointments,
  Toolbar,
  DateNavigator,
  ViewSwitcher,
  TodayButton,
  AppointmentTooltip,
  DragDropProvider
} from '@devexpress/dx-react-scheduler-material-ui';
import { updateTaskDates } from '../../api/tasks';
import { ProjectGanttProps } from '../../types/project';
import { useProjectGantt } from '../../hooks/project/useProjectGantt';

const ProjectGantt: React.FC<ProjectGanttProps> = ({ projectId, tasks: initialTasks }) => {
  const {
    tasks,
    loading,
    error,
    currentDate,
    currentViewName,
    setCurrentDate,
    setCurrentViewName,
    setError,
    renderAppointment,
    renderAppointmentContent,
    renderTooltipContent
  } = useProjectGantt(initialTasks);

  const handleTaskUpdated = async (changes: ChangeSet) => {
    try {
      if (changes.changed) {
        const taskId = Object.keys(changes.changed)[0];
        const updatedTask = changes.changed[taskId];

        if (updatedTask.startDate || updatedTask.endDate) {
          await updateTaskDates(parseInt(taskId), {
            start_date: updatedTask.startDate?.toISOString().split('T')[0],
            due_date: updatedTask.endDate?.toISOString().split('T')[0]
          });
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task dates');
    }
  };

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
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <Paper sx={{ width: '100%', minHeight: '600px', p: 2 }}>
        <Scheduler
          data={tasks || []}
          height={600}
        >
        <ViewState
          currentDate={currentDate}
          currentViewName={currentViewName}
          onCurrentDateChange={setCurrentDate}
          onCurrentViewNameChange={setCurrentViewName}
        />
        <EditingState
          onCommitChanges={handleTaskUpdated}
        />
        <IntegratedEditing />
        <DayView
          startDayHour={9}
          endDayHour={19}
        />
        <WeekView
          startDayHour={9}
          endDayHour={19}
        />
        <MonthView />
        <Toolbar />
        <DateNavigator />
        <TodayButton />
        <ViewSwitcher />
        <Appointments
          appointmentComponent={props => React.createElement(Appointments.Appointment, renderAppointment(props))}
          appointmentContentComponent={props => React.createElement(Appointments.AppointmentContent, renderAppointmentContent(props))}
        />
        <AppointmentTooltip
          contentComponent={props => React.createElement(AppointmentTooltip.Content, renderTooltipContent(props))}
          showCloseButton
        />
        <DragDropProvider />
        </Scheduler>
      </Paper>
    </Box>
  );
};

export default ProjectGantt;
