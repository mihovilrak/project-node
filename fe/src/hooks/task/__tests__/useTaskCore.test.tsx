import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskCore } from '../useTaskCore';
import {
  getTaskById,
  getSubtasks,
  getTaskStatuses,
  changeTaskStatus,
  deleteTask
} from '../../../api/tasks';
import { Task, TaskStatus } from '../../../types/task';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock API calls
jest.mock('../../../api/tasks');

describe('useTaskCore', () => {
  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    description: 'Test Description',
    project_id: 1,
    project_name: 'Test Project',
    type_id: 1,
    type_name: 'Task',
    priority_id: 1,
    priority_name: 'Medium',
    status_id: 1,
    status_name: 'To Do',
    parent_id: null,
    parent_name: null,
    holder_id: 1,
    holder_name: 'Test Holder',
    assignee_id: 2,
    assignee_name: 'Test Assignee',
    start_date: '2024-01-25T00:00:00Z',
    due_date: '2024-02-25T00:00:00Z',
    end_date: null,
    spent_time: 0,
    estimated_time: 8,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test Creator',
    created_on: '2024-01-25T00:00:00Z'
  };

  const mockSubtasks: Task[] = [
    {
      ...mockTask,
      id: 2,
      parent_id: 1,
      parent_name: 'Test Task',
      name: 'Subtask 1'
    }
  ];

  const mockStatuses: TaskStatus[] = [
    {
      id: 1,
      name: 'To Do',
      color: '#000000',
      description: null,
      active: true,
      created_on: '2024-01-25T00:00:00Z',
      updated_on: null
    },
    {
      id: 2,
      name: 'In Progress',
      color: '#0000FF',
      description: null,
      active: true,
      created_on: '2024-01-25T00:00:00Z',
      updated_on: null
    },
    {
      id: 3,
      name: 'Done',
      color: '#00FF00',
      description: null,
      active: true,
      created_on: '2024-01-25T00:00:00Z',
      updated_on: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getTaskById as jest.Mock).mockResolvedValue(mockTask);
    (getSubtasks as jest.Mock).mockResolvedValue(mockSubtasks);
    (getTaskStatuses as jest.Mock).mockResolvedValue(mockStatuses);
  });

  it('should load task data successfully', async () => {
    const { result } = renderHook(() => useTaskCore('1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.task).toEqual(mockTask);
    expect(result.current.subtasks).toEqual(mockSubtasks);
    expect(result.current.statuses).toEqual(mockStatuses);
  });

  it('should handle error when loading task data fails', async () => {
    const error = new Error('Failed to load task');
    (getTaskById as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useTaskCore('1'));

    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load task');
    expect(result.current.task).toBe(null);
  });

  it('should handle status change successfully', async () => {
    const newStatus = 2;
    (changeTaskStatus as jest.Mock).mockResolvedValue({ ...mockTask, status_id: newStatus });

    const { result } = renderHook(() => useTaskCore('1'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleStatusChange(newStatus);
    });

    expect(changeTaskStatus).toHaveBeenCalledWith(1, newStatus);
    expect(result.current.task?.status_id).toBe(newStatus);
  });

  it('should handle task deletion successfully', async () => {
    (deleteTask as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTaskCore('1'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(deleteTask).toHaveBeenCalledWith(1);
    expect(mockNavigate).toHaveBeenCalledWith('/tasks');
  });
});
