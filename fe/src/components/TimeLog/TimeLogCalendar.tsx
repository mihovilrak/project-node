import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Grid
} from '@mui/material';
import { 
  CalendarMonth,
  NavigateBefore,
  NavigateNext,
  AccessTime
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
} from 'date-fns';
import { getProjectTimeLogs } from '../../api/timeLogService';
import { TimeLog, TimeLogCalendarProps } from '../../types/timeLog';

const TimeLogCalendar: React.FC<TimeLogCalendarProps> = ({ projectId }) => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const theme = useTheme();

  useEffect(() => {
    fetchTimeLogs();
  }, [currentDate]);

  const fetchTimeLogs = async (): Promise<void> => {
    try {
      setLoading(true);
      const logs = await getProjectTimeLogs(projectId);
      setTimeLogs(logs);
    } catch (error) {
      console.error('Failed to fetch time logs:', error);
      setError('Failed to load time logs');
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: number): void => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getTimeLogsForDate = (date: Date): TimeLog[] => {
    return timeLogs.filter(log => {
      const logDate = new Date(log.created_on!);
      return logDate.toDateString() === date.toDateString();
    });
  };

  const getTotalHoursForDate = (date: Date): number => {
    const logs = getTimeLogsForDate(date);
    return logs.reduce((total, log) => total + log.spent_time / 60, 0);
  };

  const getDayColor = (hours: number): string => {
    if (hours === 0) return theme.palette.background.paper;
    if (hours < 4) return theme.palette.info.light;
    if (hours < 8) return theme.palette.success.light;
    return theme.palette.warning.light;
  };

  const renderCalendar = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    return (
      <Grid container spacing={1}>
        {days.map(day => {
          const totalHours = getTotalHoursForDate(day);
          const logs = getTimeLogsForDate(day);
          
          return (
            <Grid item xs={12/7} key={day.toString()}>
              <Tooltip title={
                <Box>
                  <Typography variant="subtitle2">
                    {format(day, 'MMMM d, yyyy')}
                  </Typography>
                  {logs.map(log => (
                    <Typography key={log.id} variant="body2">
                      {log.task_name}: {formatTime(log.spent_time)}
                    </Typography>
                  ))}
                </Box>
              }>
                <Paper
                  elevation={isToday(day) ? 3 : 1}
                  sx={{
                    p: 1,
                    height: '100px',
                    backgroundColor: getDayColor(totalHours),
                    border: isToday(day) ? `2px solid ${theme.palette.primary.main}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  <Typography variant="caption">
                    {format(day, 'd')}
                  </Typography>
                  <Chip
                    size="small"
                    icon={<AccessTime />}
                    label={`${totalHours.toFixed(1)}h`}
                    sx={{ 
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      backgroundColor: 'rgba(255,255,255,0.8)'
                    }}
                  />
                </Paper>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
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
    <Paper sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarMonth sx={{ mr: 1 }} />
          Time Log Calendar
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigateMonth(-1)}>
            <NavigateBefore />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2 }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={() => navigateMonth(1)}>
            <NavigateNext />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="textSecondary">
          Total hours this month: {
            timeLogs.reduce((total, log) => total + log.spent_time / 60, 0).toFixed(1)
          }h
        </Typography>
      </Box>

      {renderCalendar()}
    </Paper>
  );
};

export default TimeLogCalendar;
