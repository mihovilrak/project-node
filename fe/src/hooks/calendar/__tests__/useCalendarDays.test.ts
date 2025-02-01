import { renderHook } from '@testing-library/react';
import { useCalendarDays } from '../useCalendarDays';
import { Task } from '../../../types/task';
import { TimeLog } from '../../../types/timeLog';

describe('useCalendarDays', () => {
  const mockDate = new Date('2024-01-15'); // January 15, 2024
  
  const mockTasks: Task[] = [
    {
      id: 1,
      name: 'Task 1',
      description: 'Test task 1',
      status_id: 1,
      status_name: 'Open',
      priority_id: 1,
      priority_name: 'High',
      created_on: '2024-01-15T10:00:00Z',
      start_date: '2024-01-15T10:00:00Z',
      due_date: '2024-01-15T18:00:00Z',
      project_id: 1,
      project_name: 'Test Project',
      holder_id: 1,
      holder_name: 'Test Holder',
      assignee_id: 1,
      assignee_name: 'Test Assignee',
      parent_id: null,
      parent_name: null,
      type_id: 1,
      type_name: 'Task',
      created_by: 1,
      created_by_name: 'Test Creator',
      end_date: null,
      spent_time: 0,
      progress: 0,
      estimated_time: null
    },
    {
      id: 2,
      name: 'Task 2',
      description: 'Test task 2',
      status_id: 1,
      status_name: 'Open',
      priority_id: 1,
      priority_name: 'High',
      created_on: '2024-01-16T10:00:00Z',
      start_date: '2024-01-16T10:00:00Z',
      due_date: '2024-01-16T18:00:00Z',
      project_id: 1,
      project_name: 'Test Project',
      holder_id: 1,
      holder_name: 'Test Holder',
      assignee_id: 1,
      assignee_name: 'Test Assignee',
      parent_id: null,
      parent_name: null,
      type_id: 1,
      type_name: 'Task',
      created_by: 1,
      created_by_name: 'Test Creator',
      end_date: null,
      spent_time: 0,
      progress: 0,
      estimated_time: null
    }
  ];

  const mockTimeLogs: TimeLog[] = [
    {
      id: 1,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-15',
      spent_time: 2.5,
      description: 'Work on task 1',
      created_on: '2024-01-15T14:00:00Z',
      updated_on: null
    },
    {
      id: 2,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-15',
      spent_time: 1.5,
      description: 'More work on task 1',
      created_on: '2024-01-15T16:00:00Z',
      updated_on: null
    }
  ];

  it('should return calendar utility functions', () => {
    const { result } = renderHook(() => useCalendarDays(mockDate, mockTasks, mockTimeLogs));
    
    expect(result.current.getDaysInMonth).toBeDefined();
    expect(result.current.getTasksForDay).toBeDefined();
    expect(result.current.getTimeLogsForDay).toBeDefined();
    expect(result.current.calculateTotalTime).toBeDefined();
  });

  it('should generate correct number of days in month', () => {
    const { result } = renderHook(() => useCalendarDays(mockDate, mockTasks, mockTimeLogs));
    const days = result.current.getDaysInMonth();
    
    expect(days.length).toBe(42); // 6 weeks * 7 days
  });

  it('should mark current month days correctly', () => {
    const { result } = renderHook(() => useCalendarDays(mockDate, mockTasks, mockTimeLogs));
    const days = result.current.getDaysInMonth();
    
    const januaryDays = days.filter(day => day.isCurrentMonth);
    expect(januaryDays.length).toBe(31); // January has 31 days
  });

  it('should identify weekends correctly', () => {
    const { result } = renderHook(() => useCalendarDays(mockDate, mockTasks, mockTimeLogs));
    const days = result.current.getDaysInMonth();
    
    const weekends = days.filter(day => day.isWeekend);
    expect(weekends.length).toBe(12); // 6 Saturdays + 6 Sundays
  });

  it('should get tasks for specific day', () => {
    const { result } = renderHook(() => useCalendarDays(mockDate, mockTasks, mockTimeLogs));
    const tasksForDay = result.current.getTasksForDay(new Date('2024-01-15'));
    
    expect(tasksForDay.length).toBe(1);
    expect(tasksForDay[0].id).toBe(1);
  });

  it('should get time logs for specific day', () => {
    const { result } = renderHook(() => useCalendarDays(mockDate, mockTasks, mockTimeLogs));
    const timeLogsForDay = result.current.getTimeLogsForDay(new Date('2024-01-15'));
    
    expect(timeLogsForDay.length).toBe(2);
    expect(timeLogsForDay[0].id).toBe(1);
    expect(timeLogsForDay[1].id).toBe(2);
  });

  it('should calculate total time correctly', () => {
    const { result } = renderHook(() => useCalendarDays(mockDate, mockTasks, mockTimeLogs));
    const totalTime = result.current.calculateTotalTime(mockTimeLogs);
    
    expect(totalTime).toBe(4); // 2.5 + 1.5 = 4
  });

  it('should handle empty tasks and time logs', () => {
    const { result } = renderHook(() => useCalendarDays(mockDate, [], []));
    const days = result.current.getDaysInMonth();
    
    expect(days.length).toBe(42);
    expect(days[15].tasks).toEqual([]); // January 15th should have no tasks
    expect(days[15].timeLogs).toEqual([]);
    expect(days[15].totalTime).toBe(0);
  });

  it('should handle tasks with missing dates', () => {
    const tasksWithMissingDates: Task[] = [{
      id: 1,
      name: 'Task with missing dates',
      description: 'Test task',
      status_id: 1,
      status_name: 'Open',
      priority_id: 1,
      priority_name: 'High',
      created_on: '2024-01-15T10:00:00Z',
      project_id: 1,
      project_name: 'Test Project',
      holder_id: 1,
      holder_name: 'Test Holder',
      assignee_id: 1,
      assignee_name: 'Test Assignee',
      parent_id: null,
      parent_name: null,
      type_id: 1,
      type_name: 'Task',
      created_by: 1,
      created_by_name: 'Test Creator',
      start_date: null,
      due_date: null,
      end_date: null,
      spent_time: 0,
      progress: 0,
      estimated_time: null
    }];

    const { result } = renderHook(() => useCalendarDays(mockDate, tasksWithMissingDates, []));
    const tasksForDay = result.current.getTasksForDay(new Date('2024-01-15'));
    
    expect(tasksForDay).toEqual([]);
  });

  it('should handle time logs with invalid spent time', () => {
    const timeLogsWithInvalidTime: TimeLog[] = [{
      id: 1,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-15',
      spent_time: Number('invalid'),
      description: 'Invalid time log',
      created_on: '2024-01-15T14:00:00Z',
      updated_on: null
    }];

    const { result } = renderHook(() => useCalendarDays(mockDate, [], timeLogsWithInvalidTime));
    const totalTime = result.current.calculateTotalTime(timeLogsWithInvalidTime);
    
    expect(totalTime).toBe(0);
  });
});
