import React from 'react';
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
import { useCalendar } from '../../hooks/calendar/useCalendar';
import CalendarDayView from './CalendarDayView';
import CalendarWeekView from './CalendarWeekView';
import CalendarMonthView from './CalendarMonthView';

const Calendar: React.FC = () => {
  const {
    tasks,
    loading,
    view,
    selectedDate,
    timeLogs,
    handleDateChange,
    handleViewChange,
    handleTaskClick,
    handleTimeLogClick
  } = useCalendar();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => handleDateChange(new Date())} aria-label="Today">
              <Today />
            </IconButton>
            <IconButton
              aria-label="Previous Month"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                handleDateChange(newDate);
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              aria-label="Next Month"
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
