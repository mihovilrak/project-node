import { renderHook } from '@testing-library/react';
import { useTasksByHour } from '../useTasksByHour';
import { Task } from '../../../types/task';
import { TimeLog } from '../../../types/timeLog';

describe('useTasksByHour', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      name: 'Morning Task',
      description: 'Test task 1',
      status_id: 1,
      status_name: 'Open',
      priority_id: 1,
      priority_name: 'High',
      created_on: '2024-01-17T09:00:00Z',
      start_date: '2024-01-17T09:00:00Z',
      due_date: '2024-01-17T10:00:00Z',
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
      estimated_time: null,
    },
    {
      id: 2,
      name: 'Afternoon Task',
      description: 'Test task 2',
      status_id: 1,
      status_name: 'Open',
      priority_id: 1,
      priority_name: 'High',
      created_on: '2024-01-17T14:00:00Z',
      start_date: '2024-01-17T14:00:00Z',
      due_date: '2024-01-17T15:00:00Z',
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
      estimated_time: null,
    },
  ];

  const mockTimeLogs: TimeLog[] = [
    {
      id: 1,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-17',
      spent_time: 1.0,
      description: 'Work on morning task',
      created_on: '2024-01-17T09:30:00Z',
      updated_on: null,
    },
    {
      id: 2,
      task_id: 2,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-17',
      spent_time: 1.5,
      description: 'Work on afternoon task',
      created_on: '2024-01-17T14:30:00Z',
      updated_on: null,
    },
  ];

  it('should return hours array and utility functions', () => {
    const { result } = renderHook(() =>
      useTasksByHour(mockTasks, mockTimeLogs),
    );

    expect(result.current.hours).toBeDefined();
    expect(result.current.getTasksForHour).toBeDefined();
    expect(result.current.allDayTasks).toBeDefined();
    expect(result.current.dayTimeLogs).toBeDefined();
  });

  it('should generate 24 hours', () => {
    const { result } = renderHook(() =>
      useTasksByHour(mockTasks, mockTimeLogs),
    );

    expect(result.current.hours.length).toBe(24);
    expect(result.current.hours[0]).toBe(0);
    expect(result.current.hours[23]).toBe(23);
  });

  it('should get tasks for specific hour', () => {
    const { result } = renderHook(() =>
      useTasksByHour(mockTasks, mockTimeLogs),
    );

    const morningTasks = result.current.getTasksForHour(9);
    const afternoonTasks = result.current.getTasksForHour(14);
    const emptyHourTasks = result.current.getTasksForHour(12);

    expect(morningTasks.length).toBe(1);
    expect(morningTasks[0].id).toBe(1);
    expect(afternoonTasks.length).toBe(1);
    expect(afternoonTasks[0].id).toBe(2);
    expect(emptyHourTasks.length).toBe(0);
  });

  it("returns the day's time logs and their total", () => {
    const { result } = renderHook(() =>
      useTasksByHour(mockTasks, mockTimeLogs, new Date(2024, 0, 17)),
    );

    expect(result.current.dayTimeLogs.map((log) => log.id)).toEqual([1, 2]);
    expect(result.current.totalHours).toBe(2.5);
  });

  it('puts date-only tasks in allDayTasks, not in the 00:00 slot', () => {
    const dateOnly: Task = {
      ...mockTasks[0],
      id: 3,
      start_date: '2024-01-17',
      due_date: '2024-01-19',
    };
    const { result } = renderHook(() =>
      useTasksByHour([dateOnly], [], new Date(2024, 0, 17)),
    );

    expect(result.current.getTasksForHour(0)).toEqual([]);
    expect(result.current.allDayTasks.map((task) => task.id)).toEqual([3]);
  });

  it('should handle empty tasks and time logs', () => {
    const { result } = renderHook(() => useTasksByHour([], []));

    expect(result.current.hours.length).toBe(24);
    expect(result.current.getTasksForHour(9)).toEqual([]);
    expect(result.current.dayTimeLogs).toEqual([]);
    expect(result.current.totalHours).toBe(0);
  });

  it('should handle tasks with missing start date', () => {
    const tasksWithMissingDates: Task[] = [
      {
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
        estimated_time: null,
      },
    ];

    const { result } = renderHook(() =>
      useTasksByHour(tasksWithMissingDates, []),
    );
    const tasksForHour = result.current.getTasksForHour(9);

    expect(tasksForHour).toEqual([]);
  });

  it('only returns tasks for the given day', () => {
    const tasksAcrossDays: Task[] = [
      {
        id: 1,
        name: 'Task Day 1',
        description: 'Test task 1',
        status_id: 1,
        status_name: 'Open',
        priority_id: 1,
        priority_name: 'High',
        created_on: '2024-01-17T09:00:00Z',
        start_date: '2024-01-17T09:00:00Z',
        due_date: null,
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
        estimated_time: null,
      },
      {
        id: 2,
        name: 'Task Day 2',
        description: 'Test task 2',
        status_id: 1,
        status_name: 'Open',
        priority_id: 1,
        priority_name: 'High',
        created_on: '2024-01-18T09:00:00Z',
        start_date: '2024-01-18T09:00:00Z',
        due_date: null,
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
        estimated_time: null,
      },
    ];

    const { result } = renderHook(() =>
      useTasksByHour(tasksAcrossDays, [], new Date(2024, 0, 17)),
    );
    const tasksAtNine = result.current.getTasksForHour(9);

    expect(tasksAtNine.map((task) => task.id)).toEqual([1]);
  });
});
