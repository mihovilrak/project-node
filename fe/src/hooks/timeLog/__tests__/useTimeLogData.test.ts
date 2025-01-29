import { renderHook, act } from '@testing-library/react-hooks';
import { useTimeLogData } from '../useTimeLogData';
import { getProjects } from '../../../api/projects';
import { getProjectTasks } from '../../../api/tasks';
import { getUsers } from '../../../api/users';
import { getActivityTypes } from '../../../api/activityTypes';

// Mock the API calls
jest.mock('../../../api/projects');
jest.mock('../../../api/tasks');
jest.mock('../../../api/users');
jest.mock('../../../api/activityTypes');

const mockProjects = [
  { id: 1, name: 'Project 1' },
  { id: 2, name: 'Project 2' }
];

const mockTasks = [
  { id: 1, name: 'Task 1', project_id: 1 },
  { id: 2, name: 'Task 2', project_id: 1 }
];

const mockUsers = [
  { id: 1, name: 'User 1' },
  { id: 2, name: 'User 2' }
];

const mockActivityTypes = [
  { id: 1, name: 'Activity 1', color: '#000', icon: 'icon1', active: true },
  { id: 2, name: 'Activity 2', color: '#fff', icon: 'icon2', active: true }
];

describe('useTimeLogData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getProjects as jest.Mock).mockResolvedValue(mockProjects);
    (getProjectTasks as jest.Mock).mockResolvedValue(mockTasks);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (getActivityTypes as jest.Mock).mockResolvedValue(mockActivityTypes);
  });

  it('should load initial data when opened', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTimeLogData({
      open: true,
      projectId: undefined,
      hasAdminPermission: false
    }));

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(getActivityTypes).toHaveBeenCalled();
    expect(result.current.activityTypes).toEqual(mockActivityTypes);
    expect(result.current.isLoading).toBe(false);
  });

  it('should load projects and tasks on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTimeLogData({
      open: true,
      projectId: 1,
      hasAdminPermission: false
    }));

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(getProjects).toHaveBeenCalled();
    expect(getProjectTasks).toHaveBeenCalledWith(1);
    expect(result.current.projects).toEqual(mockProjects);
    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.isLoading).toBe(false);
  });

  it('should load users when has admin permission', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTimeLogData({
      open: true,
      projectId: undefined,
      hasAdminPermission: true
    }));

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(getUsers).toHaveBeenCalled();
    expect(result.current.users).toEqual(mockUsers);
  });

  it('should handle project selection', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTimeLogData({
      open: true,
      projectId: undefined,
      hasAdminPermission: false
    }));

    await waitForNextUpdate();

    act(() => {
      result.current.handleProjectSelect(1);
    });

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(getProjectTasks).toHaveBeenCalledWith(1);
    expect(result.current.tasks).toEqual(mockTasks);
  });

  it('should clear tasks when project is deselected', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTimeLogData({
      open: true,
      projectId: 1,
      hasAdminPermission: false
    }));

    await waitForNextUpdate();

    act(() => {
      result.current.handleProjectSelect(null);
    });

    expect(result.current.tasks).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getProjects as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { result, waitForNextUpdate } = renderHook(() => useTimeLogData({
      open: true,
      projectId: undefined,
      hasAdminPermission: false
    }));

    await waitForNextUpdate();

    expect(consoleError).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    
    consoleError.mockRestore();
  });
});
