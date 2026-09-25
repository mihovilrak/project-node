import { renderHook, act, waitFor } from '@testing-library/react';
import { TAG_TAB, useTypesAndRoles } from '../useTypesAndRoles';
import { createTag, deleteTag, getTags, updateTag } from '../../../api/tags';
import { useLookups } from '../../../context/LookupsContext';
import {
  getTaskTypes,
  createTaskType,
  updateTaskType,
  deleteTaskType,
} from '../../../api/taskTypes';
import {
  getActivityTypes,
  createActivityType,
  updateActivityType,
  deleteActivityType,
} from '../../../api/activityTypes';
import { getRoles, createRole, updateRole } from '../../../api/roles';
import { Role } from '../../../types/role';
import { TaskType } from '../../../types/setting';
import { ActivityType } from '../../../types/setting';

// Mock all API calls
jest.mock('../../../api/taskTypes');
jest.mock('../../../api/activityTypes');
jest.mock('../../../api/roles');
jest.mock('../../../api/tags');
jest.mock('../../../context/LookupsContext', () => ({
  useLookups: jest.fn(),
}));

const mockInvalidate = jest.fn();

describe('useTypesAndRoles', () => {
  const mockTaskTypes: TaskType[] = [
    { id: 1, name: 'Task Type 1', color: '#000000', active: true },
    { id: 2, name: 'Task Type 2', color: '#ffffff', active: false },
  ];

  const mockActivityTypes: ActivityType[] = [
    { id: 1, name: 'Activity Type 1', color: '#000000', active: true },
    { id: 2, name: 'Activity Type 2', color: '#ffffff', active: false },
  ];

  const mockRoles: Role[] = [
    { id: 1, name: 'Role 1', description: 'Description 1', permissions: [] },
    { id: 2, name: 'Role 2', description: 'Description 2', permissions: [] },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getTaskTypes as jest.Mock).mockResolvedValue(mockTaskTypes);
    (getActivityTypes as jest.Mock).mockResolvedValue(mockActivityTypes);
    (getRoles as jest.Mock).mockResolvedValue(mockRoles);
    (getTags as jest.Mock).mockResolvedValue([
      { id: 5, name: 'bug', color: '#ff0000', active: true },
    ]);
    (useLookups as jest.Mock).mockReturnValue({ invalidate: mockInvalidate });
  });

  it('should fetch all data on mount', async () => {
    const { result } = renderHook(useTypesAndRoles);

    expect(result.current.state.loading).toBe(true);
    await waitFor(() => expect(result.current.state.loading).toBe(false));

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

    const { result } = renderHook(useTypesAndRoles);

    expect(result.current.state.loading).toBe(true);
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    expect(result.current.state.error).toBe('Failed to fetch data');
    expect(result.current.state.loading).toBe(false);
  });

  it('should handle tab change', () => {
    const { result } = renderHook(useTypesAndRoles);

    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, 1);
    });

    expect(result.current.state.activeTab).toBe(1);
  });

  it('should handle create action', () => {
    const { result } = renderHook(useTypesAndRoles);

    act(() => {
      result.current.handleCreate();
    });

    expect(result.current.state.dialogOpen).toBe(true);
    expect(result.current.state.selectedItem).toBeNull();
  });

  it('should handle edit action', () => {
    const { result } = renderHook(useTypesAndRoles);
    const mockItem = mockTaskTypes[0];

    act(() => {
      result.current.handleEdit(mockItem);
    });

    expect(result.current.state.dialogOpen).toBe(true);
    expect(result.current.state.selectedItem).toEqual(mockItem);
  });

  it('should handle dialog close', () => {
    const { result } = renderHook(useTypesAndRoles);

    act(() => {
      result.current.handleDialogClose();
    });

    expect(result.current.state.dialogOpen).toBe(false);
    expect(result.current.state.selectedItem).toBeNull();
  });

  it('should create new task type', async () => {
    const newTaskType = {
      name: 'New Task Type',
      color: '#123456',
      active: true,
    };
    (createTaskType as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    await act(async () => {
      await result.current.handleSave(newTaskType);
    });

    expect(createTaskType).toHaveBeenCalledWith(newTaskType);
    expect(getTaskTypes).toHaveBeenCalledTimes(2);
  });

  it('should update existing task type', async () => {
    const updatedTaskType = {
      id: 1,
      name: 'Updated Task Type',
      color: '#123456',
      active: true,
    };
    (updateTaskType as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    await act(async () => {
      await result.current.handleSave(updatedTaskType);
    });

    expect(updateTaskType).toHaveBeenCalledWith(1, updatedTaskType);
    expect(getTaskTypes).toHaveBeenCalledTimes(2);
  });

  it('should delete task type', async () => {
    (deleteTaskType as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));

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
      permissions: [{ id: 1, name: 'Permission 1' }],
    };

    (updateRole as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    await act(async () => {
      await result.current.handleRoleUpdate(updatedRole);
    });

    expect(updateRole).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        id: 1,
        name: 'Updated Role',
        description: 'Updated Description',
        permissions: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: 'Permission 1',
            active: true,
          }),
        ]),
      }),
    );
  });

  it('should update existing role when item has no id but selectedItem is set (edit mode)', async () => {
    const roleDataWithoutId = {
      name: 'Renamed Role',
      description: 'Desc',
      active: true,
      permissions: [1],
    };
    (updateRole as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, 2);
    });
    act(() => {
      result.current.handleEdit(mockRoles[0]);
    });

    await act(async () => {
      await result.current.handleSave(roleDataWithoutId);
    });

    expect(updateRole).toHaveBeenCalledWith(1, roleDataWithoutId);
    expect(createRole).not.toHaveBeenCalled();
  });

  it('should update existing activity type when item has id', async () => {
    const updatedActivityType = {
      id: 1,
      name: 'Updated Activity Type',
      color: '#123456',
      active: true,
    };
    (updateActivityType as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, 1);
    });

    await act(async () => {
      await result.current.handleSave(updatedActivityType);
    });

    expect(updateActivityType).toHaveBeenCalledWith(1, updatedActivityType);
    expect(createActivityType).not.toHaveBeenCalled();
  });

  it('refetches with include_inactive when show inactive is toggled', async () => {
    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));
    expect(getTaskTypes).toHaveBeenLastCalledWith(expect.anything(), false);

    act(() => {
      result.current.handleShowInactiveChange(true);
    });

    await waitFor(() =>
      expect(getTaskTypes).toHaveBeenLastCalledWith(expect.anything(), true),
    );
    expect(getActivityTypes).toHaveBeenLastCalledWith(expect.anything(), true);
    expect(getTags).toHaveBeenLastCalledWith(expect.anything(), true);
    expect(result.current.state.showInactive).toBe(true);
  });

  it('reactivates a task type and refreshes the types lookup', async () => {
    (updateTaskType as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    await act(async () => {
      await result.current.handleReactivate(mockTaskTypes[1]);
    });

    expect(updateTaskType).toHaveBeenCalledWith(2, { active: true });
    expect(mockInvalidate).toHaveBeenCalledWith('types');
  });

  it('reactivates an activity type', async () => {
    (updateActivityType as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));
    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, 1);
    });

    await act(async () => {
      await result.current.handleReactivate(mockActivityTypes[1]);
    });

    expect(updateActivityType).toHaveBeenCalledWith(2, { active: true });
  });

  it('loads tags and creates, updates, deletes and reactivates them', async () => {
    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));
    expect(result.current.state.tags).toHaveLength(1);
    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, TAG_TAB);
    });

    await act(async () => {
      await result.current.handleSave({ name: 'ui', color: '#00ff00' });
    });
    expect(createTag).toHaveBeenCalledWith({ name: 'ui', color: '#00ff00' });

    await act(async () => {
      await result.current.handleSave({
        id: 5,
        name: 'bug2',
        color: '#ff0000',
      });
    });
    expect(updateTag).toHaveBeenCalledWith(5, {
      name: 'bug2',
      color: '#ff0000',
    });

    await act(async () => {
      await result.current.handleDelete(5);
    });
    expect(deleteTag).toHaveBeenCalledWith(5);

    await act(async () => {
      await result.current.handleReactivate({
        id: 5,
        name: 'bug',
        color: '#ff0000',
        active: false,
      });
    });
    expect(updateTag).toHaveBeenCalledWith(5, { active: true });
    expect(mockInvalidate).toHaveBeenCalledWith('tags');
  });

  it('rethrows save errors so the dialog can show them', async () => {
    (createTaskType as jest.Mock).mockRejectedValueOnce(new Error('Duplicate'));
    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));
    act(() => {
      result.current.handleCreate();
    });

    await act(async () => {
      await expect(
        result.current.handleSave({ name: 'X', color: '#000000' }),
      ).rejects.toThrow('Duplicate');
    });

    expect(result.current.state.dialogOpen).toBe(true);
    expect(result.current.state.error).toBeNull();
  });

  it('shows delete errors on the page', async () => {
    (deleteTaskType as jest.Mock).mockRejectedValueOnce(new Error('In use'));
    const { result } = renderHook(useTypesAndRoles);
    await waitFor(() => expect(result.current.state.loading).toBe(false));

    await act(async () => {
      await result.current.handleDelete(1);
    });

    expect(result.current.state.error).toBe('In use');
  });
});
