import { CSSProperties, useCallback, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Appointments,
  AppointmentTooltip,
} from '@devexpress/dx-react-scheduler-material-ui';
import { FormattedTask } from '../../types/project';
import { Task } from '../../types/task';
import { toLocalDate } from '../../utils/dateUtils';

export type StyledProps<P> = P & { style?: CSSProperties };
export type GanttAppointmentProps = StyledProps<Appointments.AppointmentProps>;
export type GanttAppointmentContentProps =
  StyledProps<Appointments.AppointmentContentProps>;

/**
 * Format tasks for Gantt chart display and provide styling utilities for
 * appointments based on status and priority.
 *
 * @param initialTasks Array of task objects to transform into Gantt
 *   chart-compatible format
 */
export const useProjectGantt = (initialTasks: Task[]) => {
  const [error, setErrorState] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentViewName, setCurrentViewName] = useState('Month');
  const theme = useTheme();

  const tasks = useMemo<FormattedTask[]>(
    () =>
      (initialTasks || []).map((task) => ({
        id: task.id,
        title: task.name,
        startDate: toLocalDate(task.start_date) as Date,
        endDate: toLocalDate(task.due_date) as Date,
        assigneeId: task.assignee_id ?? null,
        type_name: task.type_name,
        priority: task.priority_name,
        status: task.status_name,
        description: task.description,
      })),
    [initialTasks],
  );

  const getStatusColor = useCallback(
    (status: string) => {
      const colors: Record<string, string> = {
        new: theme.palette.grey[500],
        'in progress': theme.palette.primary.main,
        done: theme.palette.success.main,
        cancelled: theme.palette.error.main,
        deleted: theme.palette.error.dark,
        unknown: theme.palette.grey[300],
      };
      return colors[status] || colors['unknown'];
    },
    [theme],
  );

  const getPriorityColor = useCallback(
    (priority: string) => {
      const colors: Record<string, string> = {
        'very high/must': theme.palette.error.main,
        'high/should': theme.palette.warning.main,
        'normal/could': theme.palette.info.main,
        'low/would': theme.palette.success.light,
        normal: theme.palette.grey[400],
      };
      return colors[priority] || colors['normal'];
    },
    [theme],
  );

  const setError = useCallback((errorMessage: string | null) => {
    setErrorState(errorMessage);
  }, []);

  const renderAppointment = useCallback(
    ({
      children,
      style,
      data,
      draggable,
      resources,
      ...restProps
    }: GanttAppointmentProps): GanttAppointmentProps => {
      const status =
        (data.status as string | undefined)?.toLowerCase() || 'unknown';
      const priority =
        (data.priority as string | undefined)?.toLowerCase() || 'normal';

      return {
        ...restProps,
        data,
        draggable,
        resources,
        style: {
          ...style,
          backgroundColor: getStatusColor(status),
          borderLeft: `4px solid ${getPriorityColor(priority)}`,
        },
        children,
      };
    },
    [getStatusColor, getPriorityColor],
  );

  const renderAppointmentContent = useCallback(
    ({
      style,
      data,
      ...restProps
    }: GanttAppointmentContentProps): GanttAppointmentContentProps => ({
      ...restProps,
      style,
      data,
      children: (
        <div style={{ height: '100%', padding: '4px' }}>
          <div
            style={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              color: 'rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {data.type_name}
          </div>
        </div>
      ),
    }),
    [],
  );

  const renderTooltipContent = useCallback(
    ({
      appointmentData,
      ...restProps
    }: AppointmentTooltip.ContentProps): AppointmentTooltip.ContentProps => ({
      ...restProps,
      appointmentData,
      children: (
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '8px', fontWeight: 500 }}>
            {appointmentData?.title}
          </div>
          <div style={{ marginBottom: '16px', color: 'rgba(0, 0, 0, 0.6)' }}>
            {appointmentData?.description}
          </div>
          <div>Status: {appointmentData?.status}</div>
          <div>Priority: {appointmentData?.priority}</div>
          <div>Type: {appointmentData?.type_name}</div>
        </div>
      ),
    }),
    [],
  );

  return {
    tasks,
    loading: false,
    error: error,
    currentDate,
    currentViewName,
    setCurrentDate,
    setCurrentViewName,
    getStatusColor,
    getPriorityColor,
    setError,
    renderAppointment,
    renderAppointmentContent,
    renderTooltipContent,
  };
};
