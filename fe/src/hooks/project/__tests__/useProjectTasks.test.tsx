import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useProjectTasks } from '../useProjectTasks';
import { getProjectTasks } from '../../../api/tasks';
import { Task } from '../../../types/task';


// Mock dependencies
jest.mock('../../../api/tasks');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

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
      created_on: '2024-01-01'
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
      created_on: '2024-01-01'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getProjectTasks as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('should fetch project tasks on mount', async () => {
    const { result } = renderHook(() => useProjectTasks('1'), { wrapper });

    await act(async () => {
      await result.current.loadTasks();
    });

    expect(getProjectTasks).toHaveBeenCalledWith(1);
    expect(result.current.tasks).toEqual(mockTasks);
  });

  it('should handle task creation', async () => {
    const newTask = {
      ...mockTasks[0],
      id: 3,
      name: 'New Task'
    };
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useProjectTasks('1'), { wrapper });

    await act(async () => {
      await result.current.loadTasks();
    });

    await act(async () => {
      await result.current.handleTaskCreate(newTask);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/tasks/new?projectId=1');
  });

  it('should handle error during task fetch', async () => {
    const error = new Error('Failed to fetch tasks');
    (getProjectTasks as jest.Mock).mockRejectedValue(error);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useProjectTasks('1'), { wrapper });

    await act(async () => {
      await result.current.loadTasks();
    });

    expect(result.current.tasks).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load tasks:', error);
    consoleErrorSpy.mockRestore();
  });

  it('should toggle task form dialog', () => {
    const { result } = renderHook(() => useProjectTasks('1'), { wrapper });

    act(() => {
      result.current.setTaskFormOpen(true);
    });
    expect(result.current.taskFormOpen).toBe(true);

    act(() => {
      result.current.setTaskFormOpen(false);
    });
    expect(result.current.taskFormOpen).toBe(false);
  });

  it('should update tasks state', () => {
    const { result } = renderHook(() => useProjectTasks('1'), { wrapper });

    act(() => {
      result.current.setTasks(mockTasks);
    });
    expect(result.current.tasks).toEqual(mockTasks);

    act(() => {
      result.current.setTasks([mockTasks[0]]);
    });
    expect(result.current.tasks).toEqual([mockTasks[0]]);
  });
});
