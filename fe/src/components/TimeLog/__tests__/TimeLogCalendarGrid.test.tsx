import React from 'react';
import { render, screen } from '@testing-library/react';
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

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
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
    renderWithTheme(<TimeLogCalendarGrid {...mockProps} />);
    const firstDay = screen.getAllByRole('gridcell')[0];
    
    await userEvent.hover(firstDay);
    
    expect(screen.getByText('January 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('Test Task 1: 4h')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2: 2h')).toBeInTheDocument();
  });

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
    renderWithTheme(<TimeLogCalendarGrid {...mockProps} />);
    const firstDay = screen.getAllByRole('gridcell')[0];
    
    await userEvent.hover(firstDay);
    
    expect(mockProps.formatTime).toHaveBeenCalledWith(4);
    expect(mockProps.formatTime).toHaveBeenCalledWith(2);
  });
});