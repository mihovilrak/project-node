import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Button
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  ViewDay,
  ViewWeek,
  ViewModule
} from '@mui/icons-material';
import { DateCalendar } from '@mui/x-date-pickers';
import { getTasksByDateRange } from '../../api/tasks';
import CalendarDayView from './CalendarDayView';
import CalendarWeekView from './CalendarWeekView';
import CalendarMonthView from './CalendarMonthView';

const Calendar = () => {
  const [view, setView] = useState('month'); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async (start, end) => {
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

  useEffect(() => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (view === 'day') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(end.getDate() + (6 - end.getDay()));
    } else {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    }

    fetchTasks(start, end);
  }, [selectedDate, view]);

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (view === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (view === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const getViewTitle = () => {
    const options = { 
      day: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      week: { year: 'numeric', month: 'long' },
      month: { year: 'numeric', month: 'long' }
    };
    return new Intl.DateTimeFormat('en-US', options[view]).format(selectedDate);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handlePrevious}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6">{getViewTitle()}</Typography>
            <IconButton onClick={handleNext}>
              <ChevronRight />
            </IconButton>
            <IconButton onClick={() => setSelectedDate(new Date())}>
              <Today />
            </IconButton>
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
            {view === 'day' && <CalendarDayView date={selectedDate} tasks={tasks} />}
            {view === 'week' && <CalendarWeekView date={selectedDate} tasks={tasks} />}
            {view === 'month' && <CalendarMonthView date={selectedDate} tasks={tasks} />}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Calendar; 