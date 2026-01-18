import { renderHook, act } from '@testing-library/react';
import { useTimeLogCalendar } from '../useTimeLogCalendar';
import { TimeLog } from '../../../types/timeLog';
import { createTheme } from '@mui/material/styles';

const theme = createTheme();

const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    log_date: '2025-01-25',
    spent_time: 4,
    description: 'Test log 1',
    created_on: '2025-01-25T10:00:00Z',
    updated_on: null
  },
  {
    id: 2,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    log_date: '2025-01-25',
    spent_time: 2.5,
    description: 'Test log 2',
    created_on: '2025-01-25T14:00:00Z',
    updated_on: null
  }
];

// Mock useTheme hook
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: () => theme
}));

describe('useTimeLogCalendar', () => {
  it('should initialize with current date', () => {
    const { result } = renderHook(() => useTimeLogCalendar());
    expect(result.current.currentDate).toBeInstanceOf(Date);
  });

  it('should navigate months correctly', () => {
    const { result } = renderHook(() => useTimeLogCalendar());
    const initialMonth = result.current.currentDate.getMonth();

    act(() => {
      result.current.navigateMonth('next');
    });
    expect(result.current.currentDate.getMonth()).toBe((initialMonth + 1) % 12);

    act(() => {
      result.current.navigateMonth('prev');
    });
    expect(result.current.currentDate.getMonth()).toBe(initialMonth);
  });

  it('should get time logs for specific date', () => {
    const { result } = renderHook(() => useTimeLogCalendar(mockTimeLogs));
    const date = new Date('2025-01-25T00:00:00Z');
    const logs = result.current.getTimeLogsForDate(date, mockTimeLogs);
    expect(logs).toHaveLength(2);
  });

  it('should calculate total hours for date', () => {
    const { result } = renderHook(() => useTimeLogCalendar(mockTimeLogs));
    const date = new Date('2025-01-25T00:00:00Z');
    const totalHours = result.current.getTotalHoursForDate(date, mockTimeLogs);
    expect(totalHours).toBe(6.5); // 4 + 2.5
  });

  it('should format time correctly', () => {
    const { result } = renderHook(() => useTimeLogCalendar());
    expect(result.current.formatTime(2.5)).toBe('2h 30m');
    expect(result.current.formatTime('1.75')).toBe('1h 45m');
    expect(result.current.formatTime(0)).toBe('0h 0m');
    expect(result.current.formatTime('invalid')).toBe('0h 0m');
  });

  it('should get calendar days for current month', () => {
    const { result } = renderHook(() => useTimeLogCalendar());
    const days = result.current.getCalendarDays();
    expect(Array.isArray(days)).toBe(true);
    expect(days.length).toBeGreaterThan(0);
    expect(days[0]).toBeInstanceOf(Date);
  });

  it('should calculate total month hours', () => {
    const { result } = renderHook(() => useTimeLogCalendar(mockTimeLogs));
    const totalHours = result.current.getTotalMonthHours(mockTimeLogs);
    expect(totalHours).toBe(6.5); // 4 + 2.5
  });

  it('should get correct color based on hours', () => {
    const { result } = renderHook(() => useTimeLogCalendar());

    expect(result.current.getDayColor(0)).toBe(theme.palette.background.paper);
    expect(result.current.getDayColor(2)).toBe(theme.palette.info.light);
    expect(result.current.getDayColor(6)).toBe(theme.palette.success.light);
    expect(result.current.getDayColor(10)).toBe(theme.palette.warning.light);
  });
});
