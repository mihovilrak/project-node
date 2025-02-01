import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import TimeLogCalendar from '../TimeLogCalendar';
import { TimeLog } from '../../../types/timeLog';
import { getProjectTimeLogs } from '../../../api/timeLogs';
import { useTimeLogCalendar } from '../../../hooks/timeLog/useTimeLogCalendar';

// Mock dependencies
jest.mock('../../../api/timeLogs');
jest.mock('../../../hooks/timeLog/useTimeLogCalendar');
jest.mock('../TimeLogCalendarHeader', () => ({ currentDate, totalHours }: any) => (
  <div data-testid="mock-calendar-header">
    Header: {currentDate.toISOString()} - {totalHours}h
  </div>
));
jest.mock('./TimeLogCalendarGrid', () => ({ days, timeLogs }: any) => (
  <div data-testid="mock-calendar-grid">
    Grid: {days.length} days, {timeLogs.length} logs
  </div>
));

// Mock data
const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    log_date: '2023-01-01',
    spent_time: 2,
    description: 'Test log',
    created_on: '2023-01-01T10:00:00Z',
    updated_on: null,
    task_name: 'Test Task'
  }
];

const mockHookReturn = {
  currentDate: new Date('2023-01-01'),
  navigateMonth: jest.fn(),
  getTimeLogsForDate: jest.fn(),
  getTotalHoursForDate: jest.fn(),
  getDayColor: jest.fn(),
  formatTime: jest.fn(),
  getCalendarDays: jest.fn(() => [new Date('2023-01-01')]),
  getTotalMonthHours: jest.fn(() => 8)
};

describe('TimeLogCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTimeLogCalendar as jest.Mock).mockReturnValue(mockHookReturn);
  });

  test('shows loading state initially', () => {
    (getProjectTimeLogs as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(
      <ThemeProvider theme={createTheme()}>
        <TimeLogCalendar projectId={1} />
      </ThemeProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error state when API fails', async () => {
    (getProjectTimeLogs as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(
      <ThemeProvider theme={createTheme()}>
        <TimeLogCalendar projectId={1} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load time logs/)).toBeInTheDocument();
    });
  });

  test('renders calendar components with data when API succeeds', async () => {
    (getProjectTimeLogs as jest.Mock).mockResolvedValue(mockTimeLogs);
    
    render(
      <ThemeProvider theme={createTheme()}>
        <TimeLogCalendar projectId={1} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-calendar-header')).toBeInTheDocument();
      expect(screen.getByTestId('mock-calendar-grid')).toBeInTheDocument();
    });
  });

  test('fetches new data when currentDate changes', async () => {
    (getProjectTimeLogs as jest.Mock).mockResolvedValue(mockTimeLogs);
    
    render(
      <ThemeProvider theme={createTheme()}>
        <TimeLogCalendar projectId={1} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getProjectTimeLogs).toHaveBeenCalledTimes(1);
      expect(getProjectTimeLogs).toHaveBeenCalledWith(1);
    });

    // Simulate date change
    act(() => {
      mockHookReturn.currentDate = new Date('2023-02-01');
      (useTimeLogCalendar as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        currentDate: new Date('2023-02-01')
      });
    });

    await waitFor(() => {
      expect(getProjectTimeLogs).toHaveBeenCalledTimes(2);
    });
  });

  test('passes correct props to child components', async () => {
    (getProjectTimeLogs as jest.Mock).mockResolvedValue(mockTimeLogs);
    
    render(
      <ThemeProvider theme={createTheme()}>
        <TimeLogCalendar projectId={1} />
      </ThemeProvider>
    );

    await waitFor(() => {
      const header = screen.getByTestId('mock-calendar-header');
      const grid = screen.getByTestId('mock-calendar-grid');
      
      expect(header).toHaveTextContent('2023-01-01');
      expect(header).toHaveTextContent('8h');
      expect(grid).toHaveTextContent('1 days, 1 logs');
    });
  });
});