import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeLogStats from '../TimeLogStats';
import { TimeLog } from '../../../types/timeLog';

describe('TimeLogStats', () => {
  // Helper function to render component
  const renderTimeLogStats = (timeLogs: TimeLog[]) => {
    return render(<TimeLogStats timeLogs={timeLogs} />);
  };

  // Mock data
  const mockTimeLogs: TimeLog[] = [
    {
      id: 1,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2023-01-01',
      spent_time: 2.5,
      description: 'Test',
      created_on: '2023-01-01',
      updated_on: null
    },
    {
      id: 2,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2023-01-01',
      spent_time: 1.75,
      description: 'Test',
      created_on: '2023-01-01',
      updated_on: null
    }
  ];

  test('renders without crashing', () => {
    renderTimeLogStats([]);
    expect(screen.getByText('Total Time Spent:')).toBeInTheDocument();
  });

  test('shows 0h 0m for empty time logs', () => {
    renderTimeLogStats([]);
    expect(screen.getByText('0h 0m')).toBeInTheDocument();
  });

  test('correctly calculates total time from number values', () => {
    const numberTimeLogs: TimeLog[] = [{
      ...mockTimeLogs[0],
      spent_time: 2.5 // 2 hours 30 minutes
    }];
    
    renderTimeLogStats(numberTimeLogs);
    expect(screen.getByText('2h 30m')).toBeInTheDocument();
  });

  test('correctly calculates total time from string values', () => {
    const stringTimeLogs: TimeLog[] = [{
      ...mockTimeLogs[0],
      spent_time: 1.75
    }];
    
    renderTimeLogStats(stringTimeLogs);
    expect(screen.getByText('1h 45m')).toBeInTheDocument();
  });

  test('correctly calculates total time from mixed format values', () => {
    renderTimeLogStats(mockTimeLogs); // 2.5 + 1.75 = 4.25 hours (4h 15m)
    expect(screen.getByText('4h 15m')).toBeInTheDocument();
  });

  test('handles invalid time values gracefully', () => {
    const invalidTimeLogs: TimeLog[] = [{
      ...mockTimeLogs[0],
      spent_time: Number('invalid')
    }];
    
    renderTimeLogStats(invalidTimeLogs);
    expect(screen.getByText('0h 0m')).toBeInTheDocument();
  });

  test('rounds minutes correctly', () => {
    const roundingTimeLogs: TimeLog[] = [{
      ...mockTimeLogs[0],
      spent_time: 1.99
    }];
    
    renderTimeLogStats(roundingTimeLogs);
    expect(screen.getByText('1h 59m')).toBeInTheDocument();
  });

  test('handles null/undefined spent_time values', () => {
    const nullTimeLogs: TimeLog[] = [{
      ...mockTimeLogs[0],
      spent_time: null as any
    }];
    
    renderTimeLogStats(nullTimeLogs);
    expect(screen.getByText('0h 0m')).toBeInTheDocument();
  });
});