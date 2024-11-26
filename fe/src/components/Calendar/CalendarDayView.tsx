import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import { Task } from '../../types/task';
import { TimeLog } from '../../types/timeLog';
import { CalendarViewProps } from '../../types/calendar';
import { getPriorityColor } from '../../utils/taskUtils';

const CalendarDayView: React.FC<CalendarViewProps> = ({ 
  view,
  date,
  tasks,
  timeLogs,
  onDateChange,
  onViewChange,
  onTaskClick,
  onTimeLogClick 
}) => {
  const navigate = useNavigate();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getTasksForHour = (hour: number): Task[] => {
    return tasks.filter(task => {
      const taskDate = new Date(task.start_date);
      return taskDate.getHours() === hour;
    });
  };

  const getTimeLogsForHour = (hour: number): TimeLog[] => {
    return timeLogs.filter(timeLog => {
      const logDate = new Date(timeLog.created_on);
      return logDate.getHours() === hour;
    });
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
      {hours.map(hour => (
        <Paper 
          key={hour}
          variant="outlined"
          sx={{ 
            p: 2, 
            mb: 1, 
            display: 'flex',
            minHeight: 80,
            backgroundColor: hour % 2 === 0 ? 'background.default' : 'background.paper'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              width: 50,
              color: 'text.secondary',
              fontWeight: 'medium'
            }}
          >
            {hour.toString().padStart(2, '0')}:00
          </Typography>
          <Box sx={{ flex: 1 }}>
            {getTasksForHour(hour).map(task => (
              <Paper
                key={task.id}
                sx={{ 
                  p: 1, 
                  mb: 1, 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => onTaskClick(task.id)}
              >
                <Typography variant="subtitle2">{task.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={task.priority_name} 
                    size="small"
                    color={getPriorityColor(task.priority_name)}
                  />
                  <Chip 
                    label={task.status_name} 
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Paper>
            ))}
            {getTimeLogsForHour(hour).map(timeLog => (
              <Paper
                key={timeLog.id}
                sx={{ 
                  p: 1, 
                  mb: 1, 
                  cursor: 'pointer',
                  backgroundColor: timeLog.activity_type_color,
                  '&:hover': { opacity: 0.9 }
                }}
                onClick={() => onTimeLogClick(timeLog.id)}
              >
                <Typography variant="subtitle2">
                  {timeLog.task_name} - {timeLog.spent_time} minutes
                </Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default CalendarDayView;
