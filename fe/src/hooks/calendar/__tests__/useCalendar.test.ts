import { renderHook, act } from '@testing-library/react';
import { useCalendar } from '../useCalendar';
import { getTasksByDateRange } from '../../../api/tasks';
import { Task } from '../../../types/task';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
jest.mock('../../../api/tasks');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

const mockNavigate = jest.fn();
(useNavigate as jest.Mock).mockReturnValue(mockNavigate);

describe('useCalendar', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      name: 'Test Task',
      description: 'Test Description',
      status_id: 1,
      status_name: 'Open',
      priority_id: 1,
      priority_name: 'High',
      created_on: '2024-01-01T00:00:00Z',
      start_date: '2024-01-01T00:00:00Z',
      due_date: '2024-01-02T00:00:00Z',
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

  beforeEach(() => {
    jest.clearAllMocks();
    (getTasksByDateRange as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCalendar());
    
    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.view).toBe('month');
    expect(result.current.selectedDate).toBeInstanceOf(Date);
    expect(result.current.timeLogs).toEqual([]);
  });

  it('should handle date change', () => {
    const { result } = renderHook(() => useCalendar());
    const newDate = new Date('2024-02-01');

    act(() => {
      result.current.handleDateChange(newDate);
    });

    expect(result.current.selectedDate).toEqual(newDate);
  });

  it('should handle view change', () => {
    const { result } = renderHook(() => useCalendar());

    act(() => {
      result.current.handleViewChange('week');
    });

    expect(result.current.view).toBe('week');
  });

  it('should navigate to task details on task click', () => {
    const { result } = renderHook(() => useCalendar());
    const taskId = 1;

    act(() => {
      result.current.handleTaskClick(taskId);
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/tasks/${taskId}`);
  });

  it('should navigate to time log details on time log click', () => {
    const { result } = renderHook(() => useCalendar());
    const timeLogId = 1;

    act(() => {
      result.current.handleTimeLogClick(timeLogId);
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/time-logs/${timeLogId}`);
  });

  it('should fetch tasks for month view', async () => {
    const { result } = renderHook(() => useCalendar());
    
    // Wait for the initial fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getTasksByDateRange).toHaveBeenCalled();
    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.loading).toBe(false);
  });

  it('should handle fetch tasks error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getTasksByDateRange as jest.Mock).mockRejectedValueOnce(new Error('Fetch error'));

    const { result } = renderHook(() => useCalendar());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleError).toHaveBeenCalled();
    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);

    consoleError.mockRestore();
  });

  it('should fetch tasks when view changes', async () => {
    const { result } = renderHook(() => useCalendar());

    await act(async () => {
      result.current.handleViewChange('week');
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getTasksByDateRange).toHaveBeenCalledTimes(2); // Initial call + view change
    expect(result.current.view).toBe('week');
  });
});
