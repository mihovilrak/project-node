import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjectTasks } from '../useProjectTasks';
import { getProjectTasks } from '../../../api/tasks';
import { Task } from '../../../types/task';
import logger from '../../../utils/logger';

jest.mock('../../../api/tasks');

describe('useProjectTasks', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      name: 'Task 1',
      description: 'Description 1',
      project_id: 1,
      project_name: 'Test Project',
      holder_id: 1,
      holder_name: 'John Doe',
      assignee_id: 1,
      assignee_name: 'John Doe',
      parent_id: null,
      parent_name: null,
      status_id: 1,
      status_name: 'In Progress',
      priority_id: 1,
      priority_name: 'High',
      priority_color: '#ff0000',
      type_id: 1,
      type_name: 'Feature',
      type_color: '#0000ff',
      type_icon: 'feature',
      start_date: '2024-01-01',
      due_date: '2024-01-31',
      end_date: null,
      estimated_time: 10,
      spent_time: 5,
      progress: 50,
      created_by: 1,
      created_by_name: 'John Doe',
      created_on: '2024-01-01',
    },
    {
      id: 2,
      name: 'Task 2',
      description: 'Description 2',
      project_id: 1,
      project_name: 'Test Project',
      holder_id: 2,
      holder_name: 'Jane Smith',
      assignee_id: 2,
      assignee_name: 'Jane Smith',
      parent_id: null,
      parent_name: null,
      status_id: 2,
      status_name: 'To Do',
      priority_id: 2,
      priority_name: 'Medium',
      priority_color: '#ffff00',
      type_id: 2,
      type_name: 'Bug',
      type_color: '#ff0000',
      type_icon: 'bug',
      start_date: '2024-02-01',
      due_date: '2024-02-28',
      end_date: null,
      estimated_time: 20,
      spent_time: 0,
      progress: 0,
      created_by: 1,
      created_by_name: 'John Doe',
      created_on: '2024-01-01',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getProjectTasks as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('fetches project tasks once on mount', async () => {
    const { result } = renderHook(() => useProjectTasks('1'));

    await waitFor(() => expect(result.current.tasks).toEqual(mockTasks));
    expect(getProjectTasks).toHaveBeenCalledTimes(1);
    expect(getProjectTasks).toHaveBeenCalledWith(
      1,
      {},
      expect.any(AbortSignal),
    );
  });

  it('refetches on loadTasks', async () => {
    const { result } = renderHook(() => useProjectTasks('1'));
    await waitFor(() => expect(result.current.tasks).toEqual(mockTasks));

    await act(async () => {
      await result.current.loadTasks();
    });

    expect(getProjectTasks).toHaveBeenCalledTimes(2);
  });

  it('exposes an error when the fetch fails', async () => {
    const error = new Error('Failed to fetch tasks');
    (getProjectTasks as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useProjectTasks('1'));

    await waitFor(() =>
      expect(result.current.tasksError).toBe('Failed to fetch tasks'),
    );
    expect(result.current.tasks).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to load project tasks',
      error,
    );
  });
});
