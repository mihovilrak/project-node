import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import TimeLogCalendarGrid from '../TimeLogCalendarGrid';
import { TimeLog } from '../../../types/timeLog';
import userEvent from '@testing-library/user-event';

const mockTheme = createTheme();

const mockDays = [
  new Date('2023-01-01'),
  new Date('2023-01-02')
];

const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    log_date: '2023-01-01',
    spent_time: 4,
    description: 'Test task',
    created_on: '2023-01-01',
    updated_on: null,
    task_name: 'Test Task 1'
  },
  {
    id: 2,
    task_id: 2,
    user_id: 1,
    activity_type_id: 1,
    log_date: '2023-01-01',
    spent_time: 2,
    description: 'Test task 2',
    created_on: '2023-01-01',
    updated_on: null,
    task_name: 'Test Task 2'
  }
];

const mockProps = {
  days: mockDays,
  timeLogs: mockTimeLogs,
  getTimeLogsForDate: jest.fn((date) =>
    mockTimeLogs.filter(log => log.log_date === '2023-01-01')
  ),
  getTotalHoursForDate: jest.fn(() => 6),
  getDayColor: jest.fn(() => '#f0f0f0'),
  formatTime: jest.fn((time) => `${time}h`)
};

const renderWithTheme = (component: React.ReactElement, options = {}) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>,
    options
  );
};

describe('TimeLogCalendarGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correct number of days', () => {
    renderWithTheme(<TimeLogCalendarGrid {...mockProps} />);
    const gridItems = screen.getAllByRole('gridcell');
    expect(gridItems).toHaveLength(mockDays.length);
  });

  test('displays correct date format', () => {
    renderWithTheme(<TimeLogCalendarGrid {...mockProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('shows total hours chip', () => {
    renderWithTheme(<TimeLogCalendarGrid {...mockProps} />);
    const hourChips = screen.getAllByText('6.0h');
    expect(hourChips).toHaveLength(2);
  });

  test('calls helper functions with correct parameters', () => {
    renderWithTheme(<TimeLogCalendarGrid {...mockProps} />);
    expect(mockProps.getTimeLogsForDate).toHaveBeenCalledWith(mockDays[0], mockTimeLogs);
    expect(mockProps.getTotalHoursForDate).toHaveBeenCalledWith(mockDays[0], mockTimeLogs);
    expect(mockProps.getDayColor).toHaveBeenCalledWith(6);
  });

  test('renders tooltip with correct content', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithTheme(<TimeLogCalendarGrid {...mockProps} />, { container: document.body });
    const firstDay = screen.getAllByRole('gridcell')[0];
    const paper = within(firstDay).getByTestId('timelog-day-paper');

    await user.hover(paper);

    act(() => {
      jest.advanceTimersByTime(600); // MUI Tooltip default delay is 500ms
    });

    const tooltip = await screen.findByTestId('timelog-tooltip');
    expect(within(tooltip).getByText((content) => content.includes('January 1, 2023'))).toBeInTheDocument();
    expect(within(tooltip).getByText((content) => content.includes('Test Task 1: 4h'))).toBeInTheDocument();
    expect(within(tooltip).getByText((content) => content.includes('Test Task 2: 2h'))).toBeInTheDocument();

    jest.useRealTimers();
  }, 10000);

  test('applies different elevation for today', () => {
    const today = new Date();
    const mockDaysWithToday = [today];

    renderWithTheme(
      <TimeLogCalendarGrid
        {...mockProps}
        days={mockDaysWithToday}
      />
    );

    const paper = screen.getByRole('gridcell')
      .querySelector('.MuiPaper-root');

    expect(paper).toHaveStyle({
      border: `2px solid ${mockTheme.palette.primary.main}`
    });
  });

  test('formats time correctly in tooltip', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithTheme(<TimeLogCalendarGrid {...mockProps} />, { container: document.body });
    const firstDay = screen.getAllByRole('gridcell')[0];
    const paper = within(firstDay).getByTestId('timelog-day-paper');

    await user.hover(paper);

    act(() => {
      jest.advanceTimersByTime(600);
    });

    const tooltip = await screen.findByTestId('timelog-tooltip');
    expect(within(tooltip).getByText((content) => content.includes('4h'))).toBeInTheDocument();
    expect(within(tooltip).getByText((content) => content.includes('2h'))).toBeInTheDocument();

    jest.useRealTimers();
  }, 10000);
});