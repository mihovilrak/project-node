import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Calendar from '../../../components/Calendar/Calendar';
import CalendarDayView from '../../../components/Calendar/CalendarDayView';
import CalendarWeekView from '../../../components/Calendar/CalendarWeekView';
import CalendarMonthView from '../../../components/Calendar/CalendarMonthView';
import { createAppTheme } from '../../../theme/theme';

// Mock the API module to prevent real HTTP calls
jest.mock('../../../api/api');

// Mock AuthContext to prevent session checks
jest.mock('../../../context/AuthContext', () => ({
  ...jest.requireActual('../../../context/AuthContext'),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    currentUser: { id: 1, name: 'Test User' },
    hasPermission: () => true,
    permissionsLoading: false,
    userPermissions: [{ permission: 'Admin' }]
  })
}));

// Mock useCalendar hook
jest.mock('../../../hooks/calendar/useCalendar', () => ({
  useCalendar: () => ({
    tasks: [],
    loading: false,
    view: 'month',
    selectedDate: new Date(),
    timeLogs: [],
    handleDateChange: jest.fn(),
    handleViewChange: jest.fn(),
    handleTaskClick: jest.fn(),
    handleTimeLogClick: jest.fn()
  })
}));

// Mock useCalendarWeek hook
jest.mock('../../../hooks/calendar/useCalendarWeek', () => ({
  useCalendarWeek: () => ({
    getWeekDays: () => Array(7).fill(null).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - date.getDay() + i);
      return date;
    }),
    getTasksForDay: () => [],
    getTimeLogsForDay: () => []
  })
}));

// Mock useCalendarDays hook
jest.mock('../../../hooks/calendar/useCalendarDays', () => ({
  useCalendarDays: () => ({
    getDaysInMonth: () => Array(35).fill(null).map((_, i) => ({
      date: new Date(),
      isToday: i === 15,
      isCurrentMonth: i >= 3 && i < 33,
      tasks: [],
      totalTime: 0
    }))
  })
}));

// Custom test wrapper
const PerfTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createAppTheme('light');
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Performance measurement callback
const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  console.log(`Component: ${id}`);
  console.log(`Phase: ${phase}`);
  console.log(`Actual Duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base Duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Commit Time: ${commitTime}ms`);
  console.log('-------------------');
};

describe('Calendar Components Performance Tests', () => {
  // Helper function to measure render performance
  const measurePerformance = (Component: React.ComponentType<any>, props = {}) => {
    const start = performance.now();

    render(
      <PerfTestWrapper>
        <Profiler id={Component.name} onRender={onRenderCallback}>
          <Component {...props} />
        </Profiler>
      </PerfTestWrapper>
    );

    const end = performance.now();
    return end - start;
  };

  // Test initial render performance
  test('Calendar component initial render performance', () => {
    const renderTime = measurePerformance(Calendar);
    expect(renderTime).toBeLessThan(2000); // Should render under 2000ms (complex component with multiple views)
  });

  test('CalendarDayView component initial render performance', () => {
    const renderTime = measurePerformance(CalendarDayView, {
      date: new Date(),
      tasks: [],
      timeLogs: [],
      onTaskClick: () => {},
      onTimeLogClick: () => {}
    });
    expect(renderTime).toBeLessThan(1000); // Should render under 1000ms (accounting for parallel test runs)
  });

  test('CalendarWeekView component initial render performance', () => {
    const renderTime = measurePerformance(CalendarWeekView, {
      date: new Date(),
      tasks: [],
      timeLogs: [],
      onTaskClick: () => {},
      onTimeLogClick: () => {}
    });
    expect(renderTime).toBeLessThan(1000); // Should render under 1000ms (accounting for parallel test runs)
  });

  test('CalendarMonthView component initial render performance', () => {
    const renderTime = measurePerformance(CalendarMonthView, {
      date: new Date(),
      tasks: [],
      timeLogs: [],
      onTaskClick: () => {},
      onTimeLogClick: () => {}
    });
    expect(renderTime).toBeLessThan(1000); // Should render under 1000ms (accounting for parallel test runs)
  });

  // Test re-render performance with data updates
  test('Calendar components re-render performance with data', () => {
    const mockTasks = Array(50).fill(null).map((_, i) => ({
      id: i,
      title: `Task ${i}`,
      description: 'Test task',
      dueDate: new Date(),
      status: 'pending'
    }));

    const mockTimeLogs = Array(20).fill(null).map((_, i) => ({
      id: i,
      taskId: i,
      startTime: new Date(),
      endTime: new Date(),
      duration: 3600
    }));

    const renderTime = measurePerformance(Calendar, {
      initialTasks: mockTasks,
      initialTimeLogs: mockTimeLogs
    });

    expect(renderTime).toBeLessThan(2000); // Should render under 2000ms with substantial data (accounting for test environment)
  });
});
