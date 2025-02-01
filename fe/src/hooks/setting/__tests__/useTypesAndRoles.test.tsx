import { renderHook, act } from '@testing-library/react-hooks';
import { useTypesAndRoles } from '../useTypesAndRoles';
import {
  getTaskTypes,
  createTaskType,
  updateTaskType,
  deleteTaskType
} from '../../../api/taskTypes';
import {
  getActivityTypes,
  createActivityType,
  updateActivityType,
  deleteActivityType
} from '../../../api/activityTypes';
import {
  getRoles,
  createRole,
  updateRole
} from '../../../api/roles';
import { Role } from '../../../types/role';
import { TaskType } from '../../../types/setting';
import { ActivityType } from '../../../types/setting';

// Mock all API calls
jest.mock('../../../api/taskTypes');
jest.mock('../../../api/activityTypes');
jest.mock('../../../api/roles');

describe('useTypesAndRoles', () => {
  const mockTaskTypes: TaskType[] = [
    { id: 1, name: 'Task Type 1', color: '#000000', active: true },
    { id: 2, name: 'Task Type 2', color: '#ffffff', active: false }
  ];

  const mockActivityTypes: ActivityType[] = [
    { id: 1, name: 'Activity Type 1', color: '#000000', active: true },
    { id: 2, name: 'Activity Type 2', color: '#ffffff', active: false }
  ];

  const mockRoles: Role[] = [
    { id: 1, name: 'Role 1', description: 'Description 1', permissions: [] },
    { id: 2, name: 'Role 2', description: 'Description 2', permissions: [] }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getTaskTypes as jest.Mock).mockResolvedValue(mockTaskTypes);
    (getActivityTypes as jest.Mock).mockResolvedValue(mockActivityTypes);
    (getRoles as jest.Mock).mockResolvedValue(mockRoles);
  });

  it('should fetch all data on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTypesAndRoles());

    expect(result.current.state.loading).toBe(true);
    await waitForNextUpdate();

    expect(getTaskTypes).toHaveBeenCalledTimes(1);
    expect(getActivityTypes).toHaveBeenCalledTimes(1);
    expect(getRoles).toHaveBeenCalledTimes(1);

    expect(result.current.state.taskTypes).toEqual(mockTaskTypes);
    expect(result.current.state.activityTypes).toEqual(mockActivityTypes);
    expect(result.current.state.roles).toEqual(mockRoles);
    expect(result.current.state.loading).toBe(false);
  });

  it('should handle fetch error', async () => {
    const error = new Error('Failed to fetch data');
    (getTaskTypes as jest.Mock).mockRejectedValueOnce(error);

    const { result, waitForNextUpdate } = renderHook(() => useTypesAndRoles());

    expect(result.current.state.loading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.state.error).toBe('Failed to fetch data');
    expect(result.current.state.loading).toBe(false);
  });

  it('should handle tab change', () => {
    const { result } = renderHook(() => useTypesAndRoles());

    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, 1);
    });

    expect(result.current.state.activeTab).toBe(1);
  });

  it('should handle create action', () => {
    const { result } = renderHook(() => useTypesAndRoles());

    act(() => {
      result.current.handleCreate();
    });

    expect(result.current.state.dialogOpen).toBe(true);
    expect(result.current.state.selectedItem).toBeNull();
  });

  it('should handle edit action', () => {
    const { result } = renderHook(() => useTypesAndRoles());
    const mockItem = mockTaskTypes[0];

    act(() => {
      result.current.handleEdit(mockItem);
    });

    expect(result.current.state.dialogOpen).toBe(true);
    expect(result.current.state.selectedItem).toEqual(mockItem);
  });

  it('should handle dialog close', () => {
    const { result } = renderHook(() => useTypesAndRoles());

    act(() => {
      result.current.handleDialogClose();
    });

    expect(result.current.state.dialogOpen).toBe(false);
    expect(result.current.state.selectedItem).toBeNull();
  });

  it('should create new task type', async () => {
    const newTaskType = { name: 'New Task Type', color: '#123456', active: true };
    (createTaskType as jest.Mock).mockResolvedValueOnce(undefined);

    const { result, waitForNextUpdate } = renderHook(() => useTypesAndRoles());
    await waitForNextUpdate();

    await act(async () => {
      await result.current.handleSave(newTaskType);
    });

    expect(createTaskType).toHaveBeenCalledWith(newTaskType);
    expect(getTaskTypes).toHaveBeenCalledTimes(2);
  });

  it('should update existing task type', async () => {
    const updatedTaskType = { id: 1, name: 'Updated Task Type', color: '#123456', active: true };
    (updateTaskType as jest.Mock).mockResolvedValueOnce(undefined);

    const { result, waitForNextUpdate } = renderHook(() => useTypesAndRoles());
    await waitForNextUpdate();

    await act(async () => {
      await result.current.handleSave(updatedTaskType);
    });

    expect(updateTaskType).toHaveBeenCalledWith(1, updatedTaskType);
    expect(getTaskTypes).toHaveBeenCalledTimes(2);
  });

  it('should delete task type', async () => {
    (deleteTaskType as jest.Mock).mockResolvedValueOnce(undefined);

    const { result, waitForNextUpdate } = renderHook(() => useTypesAndRoles());
    await waitForNextUpdate();

    await act(async () => {
      await result.current.handleDelete(1);
    });

    expect(deleteTaskType).toHaveBeenCalledWith(1);
    expect(getTaskTypes).toHaveBeenCalledTimes(2);
  });

  it('should update role with permissions', async () => {
    const updatedRole = {
      id: 1,
      name: 'Updated Role',
      description: 'Updated Description',
      permissions: [{ id: 1, name: 'Permission 1' }]
    };

    (updateRole as jest.Mock).mockResolvedValueOnce(undefined);

    const { result, waitForNextUpdate } = renderHook(() => useTypesAndRoles());
    await waitForNextUpdate();

    await act(async () => {
      await result.current.handleRoleUpdate(updatedRole);
    });

    expect(updateRole).toHaveBeenCalledWith(1, expect.objectContaining({
      id: 1,
      name: 'Updated Role',
      description: 'Updated Description',
      permissions: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          name: 'Permission 1',
          active: true
        })
      ])
    }));
  });
});
