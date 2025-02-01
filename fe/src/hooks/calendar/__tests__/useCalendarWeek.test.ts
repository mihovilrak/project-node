import { renderHook } from '@testing-library/react';
import { useCalendarWeek } from '../useCalendarWeek';
import { Task } from '../../../types/task';
import { TimeLog } from '../../../types/timeLog';

describe('useCalendarWeek', () => {
  // Using a Wednesday to test week generation
  const mockDate = new Date('2024-01-17'); // Wednesday, January 17, 2024
  
  const mockTasks: Task[] = [
    {
      id: 1,
      name: 'Task 1',
      description: 'Test task 1',
      status_id: 1,
      status_name: 'Open',
      priority_id: 1,
      priority_name: 'High',
      created_on: '2024-01-17T10:00:00Z',
      start_date: '2024-01-17T10:00:00Z',
      due_date: '2024-01-17T18:00:00Z',
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
      created_on: '2024-01-18T10:00:00Z',
      start_date: '2024-01-18T10:00:00Z',
      due_date: '2024-01-18T18:00:00Z',
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
      log_date: '2024-01-17',
      spent_time: 2.5,
      description: 'Work on task 1',
      created_on: '2024-01-17T14:00:00Z',
      updated_on: null
    },
    {
      id: 2,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-17',
      spent_time: 1.5,
      description: 'More work on task 1',
      created_on: '2024-01-17T16:00:00Z',
      updated_on: null
    }
  ];

  it('should return calendar utility functions', () => {
    const { result } = renderHook(() => useCalendarWeek(mockDate, mockTasks, mockTimeLogs));
    
    expect(result.current.getWeekDays).toBeDefined();
    expect(result.current.getTasksForDay).toBeDefined();
    expect(result.current.getTimeLogsForDay).toBeDefined();
  });

  it('should generate correct week days', () => {
    const { result } = renderHook(() => useCalendarWeek(mockDate, mockTasks, mockTimeLogs));
    const weekDays = result.current.getWeekDays();
    
    expect(weekDays.length).toBe(7);
    expect(weekDays[0].getDay()).toBe(0); // Sunday
    expect(weekDays[6].getDay()).toBe(6); // Saturday
    
    // Check if the week contains our reference date (Wednesday)
    const hasReferenceDate = weekDays.some(day => 
      day.toDateString() === mockDate.toDateString()
    );
    expect(hasReferenceDate).toBe(true);
  });

  it('should get tasks for specific day', () => {
    const { result } = renderHook(() => useCalendarWeek(mockDate, mockTasks, mockTimeLogs));
    const tasksForDay = result.current.getTasksForDay(new Date('2024-01-17'));
    
    expect(tasksForDay.length).toBe(1);
    expect(tasksForDay[0].id).toBe(1);
  });

  it('should get time logs for specific day', () => {
    const { result } = renderHook(() => useCalendarWeek(mockDate, mockTasks, mockTimeLogs));
    const timeLogsForDay = result.current.getTimeLogsForDay(new Date('2024-01-17'));
    
    expect(timeLogsForDay.length).toBe(2);
    expect(timeLogsForDay[0].id).toBe(1);
    expect(timeLogsForDay[1].id).toBe(2);
  });

  it('should handle empty tasks and time logs', () => {
    const { result } = renderHook(() => useCalendarWeek(mockDate, [], []));
    const weekDays = result.current.getWeekDays();
    
    expect(weekDays.length).toBe(7);
    const tasksForDay = result.current.getTasksForDay(weekDays[3]); // Wednesday
    const timeLogsForDay = result.current.getTimeLogsForDay(weekDays[3]);
    
    expect(tasksForDay).toEqual([]);
    expect(timeLogsForDay).toEqual([]);
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
      created_on: '2024-01-17T10:00:00Z',
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

    const { result } = renderHook(() => useCalendarWeek(mockDate, tasksWithMissingDates, []));
    const tasksForDay = result.current.getTasksForDay(new Date('2024-01-17'));
    
    expect(tasksForDay).toEqual([]);
  });

  it('should generate correct week spanning two months', () => {
    const endOfMonthDate = new Date('2024-01-31'); // Wednesday, January 31, 2024
    const { result } = renderHook(() => useCalendarWeek(endOfMonthDate, [], []));
    const weekDays = result.current.getWeekDays();
    
    // Check if week contains days from both January and February
    const hasJanuaryDays = weekDays.some(day => day.getMonth() === 0); // January is 0
    const hasFebruaryDays = weekDays.some(day => day.getMonth() === 1); // February is 1
    
    expect(hasJanuaryDays).toBe(true);
    expect(hasFebruaryDays).toBe(true);
  });
});
