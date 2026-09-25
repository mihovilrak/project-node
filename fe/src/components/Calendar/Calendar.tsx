import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  ViewDay,
  ViewWeek,
  ViewModule,
} from '@mui/icons-material';
import { useCalendar } from '../../hooks/calendar/useCalendar';
import CalendarDayView from './CalendarDayView';
import CalendarWeekView from './CalendarWeekView';
import CalendarMonthView from './CalendarMonthView';
import { CalendarView } from '../../types/calendar';

const shiftDate = (date: Date, view: CalendarView, step: number): Date => {
  const next = new Date(date);
  if (view === 'month') {
    next.setDate(1);
    next.setMonth(next.getMonth() + step);
  } else {
    next.setDate(next.getDate() + step * (view === 'week' ? 7 : 1));
  }
  return next;
};

const Calendar: React.FC = () => {
  const {
    tasks,
    loading,
    error,
    view,
    selectedDate,
    timeLogs,
    handleDateChange,
    handleViewChange,
    handleTaskClick,
    handleTimeLogClick,
  } = useCalendar();
  const viewLabel = view.charAt(0).toUpperCase() + view.slice(1);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => handleDateChange(new Date())}
              aria-label="Today"
            >
              <Today />
            </IconButton>
            <IconButton
              aria-label={`Previous ${viewLabel}`}
              onClick={() =>
                handleDateChange(shiftDate(selectedDate, view, -1))
              }
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              aria-label={`Next ${viewLabel}`}
              onClick={() => handleDateChange(shiftDate(selectedDate, view, 1))}
            >
              <ChevronRight />
            </IconButton>
            <Typography variant="h6">
              {selectedDate.toLocaleDateString(
                'en-US',
                view === 'day'
                  ? { month: 'long', day: 'numeric', year: 'numeric' }
                  : { month: 'long', year: 'numeric' },
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Day View">
              <Button
                variant={view === 'day' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('day')}
                startIcon={<ViewDay />}
              >
                Day
              </Button>
            </Tooltip>
            <Tooltip title="Week View">
              <Button
                variant={view === 'week' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('week')}
                startIcon={<ViewWeek />}
              >
                Week
              </Button>
            </Tooltip>
            <Tooltip title="Month View">
              <Button
                variant={view === 'month' ? 'contained' : 'outlined'}
                onClick={() => handleViewChange('month')}
                startIcon={<ViewModule />}
              >
                Month
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
                data-testid="day-view"
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
                data-testid="week-view"
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
                data-testid="month-view"
              />
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Calendar;
