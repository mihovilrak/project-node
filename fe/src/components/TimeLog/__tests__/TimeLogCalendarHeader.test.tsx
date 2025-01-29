import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeLogCalendarHeader from '../TimeLogCalendarHeader';

describe('TimeLogCalendarHeader', () => {
  const defaultProps = {
    currentDate: new Date('2023-01-15'),
    totalHours: 40,
    onNavigateMonth: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main components correctly', () => {
    render(<TimeLogCalendarHeader {...defaultProps} />);

    expect(screen.getByText('Time Log Calendar')).toBeInTheDocument();
    expect(screen.getByTestId('CalendarMonthIcon')).toBeInTheDocument();
    expect(screen.getByText('January 2023')).toBeInTheDocument();
    expect(screen.getByText('Total hours this month: 40h')).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(<TimeLogCalendarHeader {...defaultProps} />);

    expect(screen.getByTestId('NavigateBeforeIcon')).toBeInTheDocument();
    expect(screen.getByTestId('NavigateNextIcon')).toBeInTheDocument();
  });

  test('calls onNavigateMonth with "prev" when clicking previous button', () => {
    render(<TimeLogCalendarHeader {...defaultProps} />);

    const prevButton = screen.getByTestId('NavigateBeforeIcon').closest('button');
    fireEvent.click(prevButton!);

    expect(defaultProps.onNavigateMonth).toHaveBeenCalledWith('prev');
    expect(defaultProps.onNavigateMonth).toHaveBeenCalledTimes(1);
  });

  test('calls onNavigateMonth with "next" when clicking next button', () => {
    render(<TimeLogCalendarHeader {...defaultProps} />);

    const nextButton = screen.getByTestId('NavigateNextIcon').closest('button');
    fireEvent.click(nextButton!);

    expect(defaultProps.onNavigateMonth).toHaveBeenCalledWith('next');
    expect(defaultProps.onNavigateMonth).toHaveBeenCalledTimes(1);
  });

  test('formats different dates correctly', () => {
    const { rerender } = render(<TimeLogCalendarHeader {...defaultProps} />);
    expect(screen.getByText('January 2023')).toBeInTheDocument();

    rerender(
      <TimeLogCalendarHeader
        {...defaultProps}
        currentDate={new Date('2023-12-15')}
      />
    );
    expect(screen.getByText('December 2023')).toBeInTheDocument();
  });

  test('updates total hours when prop changes', () => {
    const { rerender } = render(<TimeLogCalendarHeader {...defaultProps} />);
    expect(screen.getByText('Total hours this month: 40h')).toBeInTheDocument();

    rerender(
      <TimeLogCalendarHeader
        {...defaultProps}
        totalHours={60}
      />
    );
    expect(screen.getByText('Total hours this month: 60h')).toBeInTheDocument();
  });
});