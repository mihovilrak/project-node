import { renderHook } from '@testing-library/react-hooks';
import { useProjectSelect } from '../useProjectSelect';
import { getProjects, getProjectMembers } from '../../../api/projects';
import { getProjectTasks } from '../../../api/tasks';
import { Project, ProjectMember } from '../../../types/project';
import { Task } from '../../../types/task';

// Mock API calls
jest.mock('../../../api/projects');
jest.mock('../../../api/tasks');

describe('useProjectSelect', () => {
  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Test Project 1',
      description: 'Test Description 1',
      parent_id: null,
      parent_name: null,
      status_id: 1,
      status_name: 'Active',
      start_date: '2024-01-25T00:00:00Z',
      due_date: '2024-02-25T00:00:00Z',
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-25T00:00:00Z',
      estimated_time: 40,
      spent_time: 0,
      progress: 0
    },
    {
      id: 2,
      name: 'Test Project 2',
      description: 'Test Description 2',
      parent_id: null,
      parent_name: null,
      status_id: 1,
      status_name: 'Active',
      start_date: '2024-01-25T00:00:00Z',
      due_date: '2024-02-25T00:00:00Z',
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-25T00:00:00Z',
      estimated_time: 40,
      spent_time: 0,
      progress: 0
    }
  ];

  const mockProjectMembers: ProjectMember[] = [
    {
      user_id: 1,
      project_id: 1,
      role_id: 1,
      created_on: '2024-01-25T00:00:00Z'
    }
  ];

  const mockTasks: Task[] = [
    {
      id: 1,
      project_id: 1,
      project_name: 'Test Project 1',
      parent_id: null,
      parent_name: null,
      assignee_id: 1,
      assignee_name: 'Test User',
      holder_id: 1,
      holder_name: 'Test User',
      name: 'Test Task 1',
      description: 'Test Description 1',
      type_id: 1,
      type_name: 'Task',
      type_color: '#FF0000',
      status_id: 1,
      status_name: 'To Do',
      priority_id: 1,
      priority_name: 'High',
      priority_color: '#FF0000',
      start_date: '2024-01-25T00:00:00Z',
      due_date: '2024-02-25T00:00:00Z',
      end_date: null,
      spent_time: 0,
      progress: 0,
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-25T00:00:00Z',
      estimated_time: 8
    },
    {
      id: 2,
      project_id: 1,
      project_name: 'Test Project 1',
      parent_id: null,
      parent_name: null,
      assignee_id: 1,
      assignee_name: 'Test User',
      holder_id: 1,
      holder_name: 'Test User',
      name: 'Test Task 2',
      description: 'Test Description 2',
      type_id: 1,
      type_name: 'Task',
      type_color: '#FF0000',
      status_id: 1,
      status_name: 'To Do',
      priority_id: 1,
      priority_name: 'High',
      priority_color: '#FF0000',
      start_date: '2024-01-25T00:00:00Z',
      due_date: '2024-02-25T00:00:00Z',
      end_date: null,
      spent_time: 0,
      progress: 0,
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-25T00:00:00Z',
      estimated_time: 8
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getProjects as jest.Mock).mockResolvedValue(mockProjects);
    (getProjectMembers as jest.Mock).mockResolvedValue(mockProjectMembers);
    (getProjectTasks as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('should load projects on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjectSelect());

    await waitForNextUpdate();

    expect(getProjects).toHaveBeenCalled();
    expect(result.current.projects).toEqual(mockProjects);
  });

  it('should load project members and tasks when projectId is provided', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjectSelect(1));

    await waitForNextUpdate(); // Wait for projects
    await waitForNextUpdate(); // Wait for members and tasks

    expect(getProjectMembers).toHaveBeenCalledWith(1);
    expect(getProjectTasks).toHaveBeenCalledWith(1);
    expect(result.current.projectMembers).toEqual(mockProjectMembers);
    expect(result.current.projectTasks).toEqual(mockTasks);
  });

  it('should filter out current task from project tasks', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProjectSelect(1, '1'));

    await waitForNextUpdate(); // Wait for projects
    await waitForNextUpdate(); // Wait for members and tasks

    expect(result.current.projectTasks).toEqual([mockTasks[1]]);
  });

  it('should handle error when loading projects fails', async () => {
    const error = new Error('Failed to fetch projects');
    (getProjects as jest.Mock).mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result, waitForNextUpdate } = renderHook(() => useProjectSelect());

    await waitForNextUpdate();

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching projects:', error);
    expect(result.current.projects).toEqual([]);

    consoleSpy.mockRestore();
  });

  it('should handle error when loading project data fails', async () => {
    const error = new Error('Failed to fetch project data');
    (getProjectMembers as jest.Mock).mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result, waitForNextUpdate } = renderHook(() => useProjectSelect(1));

    await waitForNextUpdate(); // Wait for projects
    await waitForNextUpdate(); // Wait for members and tasks

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching project data:', error);
    expect(result.current.projectMembers).toEqual([]);
    expect(result.current.projectTasks).toEqual([]);

    consoleSpy.mockRestore();
  });

  it('should update project data when projectId changes', async () => {
    const { result, waitForNextUpdate, rerender } = renderHook(
      (props) => useProjectSelect(props.projectId, props.taskId),
      { initialProps: { projectId: 1, taskId: null } }
    );

    await waitForNextUpdate(); // Wait for projects
    await waitForNextUpdate(); // Wait for members and tasks

    const newProjectMembers = [
      {
        user_id: 2,
        project_id: 2,
        role_id: 1,
        created_on: '2024-01-25T00:00:00Z'
      }
    ];
    const newTasks = [
      {
        id: 3,
        project_id: 2,
        project_name: 'Test Project 2',
        parent_id: null,
        parent_name: null,
        assignee_id: 2,
        assignee_name: 'Test User 2',
        holder_id: 2,
        holder_name: 'Test User 2',
        name: 'Test Task 3',
        description: 'Test Description 3',
        type_id: 1,
        type_name: 'Task',
        type_color: '#FF0000',
        status_id: 1,
        status_name: 'To Do',
        priority_id: 1,
        priority_name: 'High',
        priority_color: '#FF0000',
        start_date: '2024-01-25T00:00:00Z',
        due_date: '2024-02-25T00:00:00Z',
        end_date: null,
        spent_time: 0,
        progress: 0,
        created_by: 1,
        created_by_name: 'Test User',
        created_on: '2024-01-25T00:00:00Z',
        estimated_time: 8
      }
    ];

    (getProjectMembers as jest.Mock).mockResolvedValue(newProjectMembers);
    (getProjectTasks as jest.Mock).mockResolvedValue(newTasks);

    rerender({ projectId: 2, taskId: null });
    await waitForNextUpdate();

    expect(getProjectMembers).toHaveBeenCalledWith(2);
    expect(getProjectTasks).toHaveBeenCalledWith(2);
    expect(result.current.projectMembers).toEqual(newProjectMembers);
    expect(result.current.projectTasks).toEqual(newTasks);
  });
});
