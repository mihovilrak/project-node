import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import { CalendarViewProps } from '../../types/calendar';
import { getPriorityColor } from '../../utils/taskUtils';
import { useTasksByHour } from '../../hooks/calendar/useTasksByHour';

const CalendarDayView: React.FC<CalendarViewProps> = ({ 
  tasks,
  timeLogs,
  onTaskClick,
  onTimeLogClick 
}) => {
  const { hours, getTasksForHour, getTimeLogsForHour } = useTasksByHour(tasks, timeLogs);

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
