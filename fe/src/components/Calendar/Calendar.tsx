import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip, 
  CircularProgress 
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  Today, 
  ViewDay, 
  ViewWeek, 
  ViewModule 
} from '@mui/icons-material';
import { getTasksByDateRange } from '../../api/tasks';
import { Task } from '../../types/task';
import { TimeLog } from '../../types/timeLog';
import { CalendarView } from '../../types/calendar';
import CalendarDayView from './CalendarDayView';
import CalendarWeekView from './CalendarWeekView';
import CalendarMonthView from './CalendarMonthView';
import { useNavigate } from 'react-router-dom';

const Calendar: React.FC = () => {
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const navigate = useNavigate();

  const fetchTasks = async (start: Date, end: Date): Promise<void> => {
    try {
      setLoading(true);
      const tasksData = await getTasksByDateRange(start, end);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: Date): void => {
    setSelectedDate(newDate);
  };

  const handleViewChange = (newView: CalendarView): void => {
    setView(newView);
  };

  const handleTaskClick = (taskId: number): void => {
    navigate(`/tasks/${taskId}`);
  };

  const handleTimeLogClick = (timeLogId: number): void => {
    navigate(`/time-logs/${timeLogId}`);
  };

  useEffect(() => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    
    if (view === 'month') {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    } else if (view === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(end.getDate() + (6 - end.getDay()));
    }
    
    fetchTasks(start, end);
  }, [selectedDate, view]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => handleDateChange(new Date())}>
              <Today />
            </IconButton>
            <IconButton
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                handleDateChange(newDate);
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                handleDateChange(newDate);
              }}
            >
              <ChevronRight />
            </IconButton>
            <Typography variant="h6">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Day View">
              <Button
                variant={view === 'day' ? 'contained' : 'outlined'}
                onClick={() => setView('day')}
                startIcon={<ViewDay />}
              >
                Day
              </Button>
            </Tooltip>
            <Tooltip title="Week View">
              <Button
                variant={view === 'week' ? 'contained' : 'outlined'}
                onClick={() => setView('week')}
                startIcon={<ViewWeek />}
              >
                Week
              </Button>
            </Tooltip>
            <Tooltip title="Month View">
              <Button
                variant={view === 'month' ? 'contained' : 'outlined'}
                onClick={() => setView('month')}
                startIcon={<ViewModule />}
              >
                Month
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {view === 'day' && (
              <CalendarDayView
                view={view}
                date={selectedDate}
                tasks={tasks}
                timeLogs={timeLogs}
                onDateChange={handleDateChange}
                onViewChange={handleViewChange}
                onTaskClick={handleTaskClick}
                onTimeLogClick={handleTimeLogClick}
              />
            )}
            {view === 'week' && (
              <CalendarWeekView
                view={view}
                date={selectedDate}
                tasks={tasks}
                timeLogs={timeLogs}
                onDateChange={handleDateChange}
                onViewChange={handleViewChange}
                onTaskClick={handleTaskClick}
                onTimeLogClick={handleTimeLogClick}
              />
            )}
            {view === 'month' && (
              <CalendarMonthView
                view={view}
                date={selectedDate}
                tasks={tasks}
                timeLogs={timeLogs}
                onDateChange={handleDateChange}
                onViewChange={handleViewChange}
                onTaskClick={handleTaskClick}
                onTimeLogClick={handleTimeLogClick}
              />
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Calendar;
