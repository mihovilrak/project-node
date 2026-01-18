import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Calendar from '../Calendar';
import { useCalendar } from '../../../hooks/calendar/useCalendar';

// Mock all child components
jest.mock('../CalendarDayView', () => ({
  __esModule: true,
  default: () => <div data-testid="day-view">Day View</div>
}));
jest.mock('../CalendarWeekView', () => ({
  __esModule: true,
  default: () => <div data-testid="week-view">Week View</div>
}));
jest.mock('../CalendarMonthView', () => ({
  __esModule: true,
  default: () => <div data-testid="month-view">Month View</div>
}));

// Mock the useCalendar hook
jest.mock('../../../hooks/calendar/useCalendar', () => ({
  useCalendar: jest.fn()
}));

describe('Calendar Component', () => {
  const mockDate = new Date('2024-01-15');
  const defaultMockProps = {
    tasks: [],
    loading: false,
    view: 'month',
    selectedDate: mockDate,
    timeLogs: [],
    handleDateChange: jest.fn(),
    handleViewChange: jest.fn(),
    handleTaskClick: jest.fn(),
    handleTimeLogClick: jest.fn()
  };

  beforeEach(() => {
    (useCalendar as jest.Mock).mockReturnValue(defaultMockProps);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading spinner when loading is true', () => {
    (useCalendar as jest.Mock).mockReturnValue({
      ...defaultMockProps,
      loading: true
    });
    render(<Calendar />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders month view by default', () => {
    render(<Calendar />);
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  test('switches between different views', () => {
    render(<Calendar />);

    const dayButton = screen.getByText('Day');
    const weekButton = screen.getByText('Week');
    const monthButton = screen.getByText('Month');

    fireEvent.click(dayButton);
    expect(defaultMockProps.handleViewChange).toHaveBeenCalledWith('day');

    fireEvent.click(weekButton);
    expect(defaultMockProps.handleViewChange).toHaveBeenCalledWith('week');

    fireEvent.click(monthButton);
    expect(defaultMockProps.handleViewChange).toHaveBeenCalledWith('month');
  });

  test('handles date navigation', () => {
    render(<Calendar />);

    // Test Today button
    const todayButton = screen.getByTestId('TodayIcon').parentElement;
    fireEvent.click(todayButton!);
    expect(defaultMockProps.handleDateChange).toHaveBeenCalledWith(expect.any(Date));

    // Test Previous Month
    const prevButton = screen.getByTestId('ChevronLeftIcon').parentElement;
    fireEvent.click(prevButton!);
    expect(defaultMockProps.handleDateChange).toHaveBeenCalled();

    // Test Next Month
    const nextButton = screen.getByTestId('ChevronRightIcon').parentElement;
    fireEvent.click(nextButton!);
    expect(defaultMockProps.handleDateChange).toHaveBeenCalled();
  });

  test('displays correct date format in header', () => {
    render(<Calendar />);
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('renders correct view based on view prop', () => {
    // Test Day View
    (useCalendar as jest.Mock).mockReturnValue({
      ...defaultMockProps,
      view: 'day'
    });
    const { rerender } = render(<Calendar />);
    expect(screen.getByTestId('day-view')).toBeInTheDocument();

    // Test Week View
    (useCalendar as jest.Mock).mockReturnValue({
      ...defaultMockProps,
      view: 'week'
    });
    rerender(<Calendar />);
    expect(screen.getByTestId('week-view')).toBeInTheDocument();

    // Test Month View
    (useCalendar as jest.Mock).mockReturnValue({
      ...defaultMockProps,
      view: 'month'
    });
    rerender(<Calendar />);
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  test('applies correct button variants based on selected view', () => {
    (useCalendar as jest.Mock).mockReturnValue({
      ...defaultMockProps,
      view: 'day'
    });
    render(<Calendar />);

    expect(screen.getByText('Day')).toHaveClass('MuiButton-contained');
    expect(screen.getByText('Week')).toHaveClass('MuiButton-outlined');
    expect(screen.getByText('Month')).toHaveClass('MuiButton-outlined');
  });
});