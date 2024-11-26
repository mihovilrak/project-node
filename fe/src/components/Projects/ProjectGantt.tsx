import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import {
  ViewState,
  EditingState,
  IntegratedEditing,
  ChangeSet,
  AppointmentModel,
  ValidResourceInstance,
  FormatterFn,
  SchedulerDateTime
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
import { FormattedTask } from '../../types/project';

type AppointmentComponentProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  data: FormattedTask;
  draggable: boolean;
  resources: ValidResourceInstance[];
  [key: string]: any;
}

type AppointmentContentComponentProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  data: FormattedTask;
  formatDate: FormatterFn;
  type: 'horizontal' | 'vertical';
  durationType: 'long' | 'short' | 'middle';
  recurringIconComponent: React.ComponentType<object>;
  resources: ValidResourceInstance[];
  [key: string]: any;
}

type TooltipContentComponentProps = AppointmentTooltip.ContentProps & {
  appointmentData: FormattedTask;
}

const ProjectGantt: React.FC<ProjectGanttProps> = ({ projectId, tasks: initialTasks }) => {
  const [tasks, setTasks] = useState<FormattedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentViewName, setCurrentViewName] = useState('Month');
  const theme = useTheme();

  useEffect(() => {
    if (initialTasks) {
      const formattedTasks: FormattedTask[] = initialTasks.map(task => ({
        id: task.id,
        title: task.name,
        startDate: new Date(task.start_date),
        endDate: new Date(task.due_date),
        assigneeId: task.assignee_id,
        type_name: task.type_name,
        priority: task.priority_name,
        status: task.status_name,
        description: task.description,
      }));
      setTasks(formattedTasks);
      setLoading(false);
    }
  }, [initialTasks]);

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

  const Appointment = React.memo<AppointmentComponentProps>(({
    children,
    style,
    data,
    draggable,
    resources,
    ...restProps
  }) => {
    const status = data.status?.toLowerCase() || 'unknown';
    const priority = data.priority?.toLowerCase() || 'normal';
    
    const getStatusColor = () => {
      const colors: Record<string, string> = {
        'new': theme.palette.grey[500],
        'in progress': theme.palette.primary.main,
        'done': theme.palette.success.main,
        'cancelled': theme.palette.error.main,
        'deleted': theme.palette.error.dark,
        'unknown': theme.palette.grey[300]
      };
      return colors[status] || colors['unknown'];
    };

    const getPriorityColor = () => {
      const colors: Record<string, string> = {
        'very high/must': theme.palette.error.main,
        'high/should': theme.palette.warning.main,
        'normal/could': theme.palette.info.main,
        'low/would': theme.palette.success.light,
        'normal': theme.palette.grey[400]
      };
      return colors[priority] || colors['normal'];
    };

    return (
      <Appointments.Appointment
        {...restProps}
        data={data}
        draggable={draggable}
        resources={resources}
        style={{
          ...style,
          backgroundColor: getStatusColor(),
          borderLeft: `4px solid ${getPriorityColor()}`,
        }}
      >
        {children}
      </Appointments.Appointment>
    );
  });

  const AppointmentContent = React.memo<AppointmentContentComponentProps>(({
    children,
    style,
    data,
    formatDate,
    type,
    durationType,
    recurringIconComponent,
    resources,
    ...restProps
  }) => (
    <Appointments.AppointmentContent
      {...restProps}
      style={style}
      data={data}
      formatDate={formatDate}
      type={type}
      durationType={durationType}
      recurringIconComponent={recurringIconComponent}
      resources={resources}
    >
      <Box sx={{ height: '100%', p: 0.5 }}>
        <Typography variant="subtitle2" noWrap>
          {data.title}
        </Typography>
        <Typography variant="caption" color="textSecondary" noWrap>
          {data.type_name}
        </Typography>
      </Box>
    </Appointments.AppointmentContent>
  ));

  const TooltipContent = React.memo<TooltipContentComponentProps>(({
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
          Type: {appointmentData.type_name}
        </Typography>
      </Box>
    </AppointmentTooltip.Content>
  ));

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
          appointmentComponent={Appointment as any}
          appointmentContentComponent={AppointmentContent as any}
        />
        <AppointmentTooltip
          contentComponent={TooltipContent as any}
          showCloseButton
        />
        <DragDropProvider />
      </Scheduler>
    </Paper>
  );
};

export default ProjectGantt;