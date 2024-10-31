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
  useTheme
} from '@mui/material';
import { 
  CalendarMonth,
  NavigateBefore,
  NavigateNext,
  AccessTime
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { getUserTimeLogs } from '../../api/timeLogs';

const TimeLogCalendar = () => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const theme = useTheme();

  useEffect(() => {
    fetchTimeLogs();
  }, [currentDate]);

  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const logs = await getUserTimeLogs({
        start_date: start.toISOString(),
        end_date: end.toISOString()
      });
      
      setTimeLogs(logs);
    } catch (error) {
      console.error('Failed to fetch time logs:', error);
      setError('Failed to load time logs');
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getTimeLogsForDate = (date) => {
    return timeLogs.filter(log => {
      const logDate = new Date(log.start_time);
      return logDate.toDateString() === date.toDateString();
    });
  };

  const getTotalHoursForDate = (date) => {
    const logs = getTimeLogsForDate(date);
    return logs.reduce((total, log) => {
      const start = new Date(log.start_time);
      const end = new Date(log.end_time);
      const hours = (end - start) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  };

  const getDayColor = (hours) => {
    if (hours === 0) return theme.palette.grey[100];
    if (hours < 4) return theme.palette.info.light;
    if (hours < 8) return theme.palette.success.light;
    return theme.palette.success.main;
  };

  const renderCalendar = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });

    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 1,
        mt: 2 
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box 
            key={day}
            sx={{ 
              textAlign: 'center',
              fontWeight: 'bold',
              color: theme.palette.text.secondary
            }}
          >
            {day}
          </Box>
        ))}
        
        {days.map(day => {
          const totalHours = getTotalHoursForDate(day);
          const logs = getTimeLogsForDate(day);
          
          return (
            <Paper
              key={day.toString()}
              elevation={isToday(day) ? 3 : 1}
              sx={{
                p: 1,
                height: '100px',
                backgroundColor: getDayColor(totalHours),
                border: isToday(day) ? `2px solid ${theme.palette.primary.main}` : 'none',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                cursor: logs.length > 0 ? 'pointer' : 'default',
                '&:hover': logs.length > 0 ? {
                  elevation: 3,
                  opacity: 0.9
                } : {}
              }}
            >
              <Typography variant="subtitle2">
                {format(day, 'd')}
              </Typography>
              {totalHours > 0 && (
                <Tooltip title={
                  <Box>
                    {logs.map(log => (
                      <Typography key={log.id} variant="body2">
                        {log.task_name}: {format(new Date(log.start_time), 'HH:mm')} - 
                        {format(new Date(log.end_time), 'HH:mm')}
                      </Typography>
                    ))}
                  </Box>
                }>
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
                </Tooltip>
              )}
            </Paper>
          );
        })}
      </Box>
    );
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
            timeLogs.reduce((total, log) => {
              const start = new Date(log.start_time);
              const end = new Date(log.end_time);
              return total + ((end - start) / (1000 * 60 * 60));
            }, 0).toFixed(1)
          }h
        </Typography>
      </Box>

      {renderCalendar()}
    </Paper>
  );
};

export default TimeLogCalendar; 