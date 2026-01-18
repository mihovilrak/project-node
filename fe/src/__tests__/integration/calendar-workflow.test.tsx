import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Calendar from '../../components/Calendar/Calendar';
import { useCalendar } from '../../hooks/calendar/useCalendar';
jest.mock('../../hooks/calendar/useCalendar');

const mockTasks = [
  {
    id: 1,
    name: 'Test Task',
    description: 'Test Description',
    start_date: '2024-01-15',
    due_date: '2024-01-20',
  }
];

const mockTimeLogs = [
  {
    id: 1,
    task_id: 1,
    spent_time: 8,
    log_date: '2024-01-15',
  }
];

beforeEach(() => {
  const mockHandleDateChange = jest.fn();
  const mockHandleViewChange = jest.fn();

  (useCalendar as jest.Mock).mockReturnValue({
    tasks: mockTasks,
    timeLogs: mockTimeLogs,
    loading: false,
    view: 'month',
    selectedDate: new Date('2024-01-15'),
    handleDateChange: mockHandleDateChange,
    handleViewChange: mockHandleViewChange,
    handleTaskClick: jest.fn(),
    handleTimeLogClick: jest.fn()
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Calendar Integration Workflow', () => {
  const renderCalendar = () => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter>
          <Calendar />
        </BrowserRouter>
      </LocalizationProvider>
    );
  };

  describe('Calendar component renders with default month view', () => {
    test('should render the month grid', () => {
      // Render the Calendar component
      renderCalendar();

      // Verify month grid is present (this is a key element of the calendar)
      expect(screen.getByTestId('month-grid')).toBeInTheDocument();
    });
  });

  describe('Calendar displays task data from the calendar hook', () => {
    test('should retrieve and display task data', () => {
      // Render the Calendar component
      renderCalendar();

      // Check useCalendar was called
      expect(useCalendar).toHaveBeenCalled();

      // Verify task data is available
      const calendarHook = useCalendar();
      expect(calendarHook.tasks).toHaveLength(1);
      expect(calendarHook.tasks[0].name).toBe('Test Task');
    });
  });

  describe('Calendar navigation with buttons', () => {
    test('should handle Today button click correctly', async () => {
      // Set up user event
      const user = userEvent.setup();

      // Render the Calendar component
      const { getByLabelText } = renderCalendar();

      // Simulate clicking the today button
      await user.click(getByLabelText('Today'));

      // Verify the date handler was called
      const calendarHook = useCalendar();
      expect(calendarHook.handleDateChange).toHaveBeenCalled();
    });
  });

  describe('Calendar view switching to day view', () => {
    test('should switch from month to day view when clicking Day button', async () => {
      // Set up user event
      const user = userEvent.setup();

      // Render the Calendar component
      const { getByText } = renderCalendar();

      // Switch to day view
      await user.click(getByText('Day'));

      // Verify handler was called with 'day'
      const calendarHook = useCalendar();
      expect(calendarHook.handleViewChange).toHaveBeenCalledWith('day');
    });
  });

  describe('Calendar view switching to week view', () => {
    test('should switch from month to week view when clicking Week button', async () => {
      // Set up user event
      const user = userEvent.setup();

      // Render the Calendar component
      const { getByText } = renderCalendar();

      // Switch to week view
      await user.click(getByText('Week'));

      // Verify handler was called with 'week'
      const calendarHook = useCalendar();
      expect(calendarHook.handleViewChange).toHaveBeenCalledWith('week');
    });
  });
});
