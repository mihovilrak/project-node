import { renderHook, act, waitFor } from '@testing-library/react';
import { useRoleDialog } from '../useRoleDialog';
import { getAllPermissions } from '../../../api/permissions';
import { Role } from '../../../types/role';
import { Permission } from '../../../types/setting';

// Mock the API calls
jest.mock('../../../api/permissions');

describe('useRoleDialog', () => {
  const mockPermissions: Permission[] = [
    { id: 1, name: 'project_create' },
    { id: 2, name: 'project_edit' },
    { id: 3, name: 'user_create' }
  ];

  const mockRole: Role = {
    id: 1,
    name: 'Admin',
    description: 'Administrator role',
    active: true,
    permissions: [1, 2],
    created_on: '2024-01-25T00:00:00Z',
    updated_on: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAllPermissions as jest.Mock).mockResolvedValue(mockPermissions);
  });

  it('should initialize with empty form data when no role is provided', async () => {
    const { result } = renderHook(() => useRoleDialog(undefined));

    await waitFor(() => expect(result.current.groupedPermissions).not.toEqual({})); // Wait for permissions to load

    expect(result.current.formData).toEqual({
      name: '',
      description: '',
      active: true,
      permissions: []
    });
  });

  it('should initialize with role data when role is provided', async () => {
    const { result } = renderHook(() => useRoleDialog(mockRole));

    await waitFor(() => expect(result.current.groupedPermissions).not.toEqual({})); // Wait for permissions to load

    expect(result.current.formData).toEqual({
      name: mockRole.name,
      description: mockRole.description,
      active: mockRole.active,
      permissions: mockRole.permissions
    });
  });

  it('should fetch and group permissions on mount', async () => {
    const { result } = renderHook(() => useRoleDialog(undefined));

    await waitFor(() => expect(result.current.groupedPermissions).not.toEqual({}));

    expect(getAllPermissions).toHaveBeenCalledTimes(1);
    expect(result.current.groupedPermissions).toEqual({
      'project': [
        { id: 1, name: 'project_create' },
        { id: 2, name: 'project_edit' }
      ],
      'user': [
        { id: 3, name: 'user_create' }
      ]
    });
  });

  it('should handle permission fetch error', async () => {
    const error = new Error('Failed to fetch permissions');
    (getAllPermissions as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRoleDialog(undefined));

    await waitFor(() => expect(result.current.error).toBe('Failed to load permissions'));

  });

  it('should handle form field changes', async () => {
    const { result } = renderHook(() => useRoleDialog(undefined));

    await waitFor(() => expect(result.current.groupedPermissions).not.toEqual({}));

    act(() => {
      result.current.handleChange('name', 'New Role');
    });

    expect(result.current.formData.name).toBe('New Role');

    act(() => {
      result.current.handleChange('active', false);
    });

    expect(result.current.formData.active).toBe(false);
  });

  it('should handle permission toggle', async () => {
    const { result } = renderHook(() => useRoleDialog(undefined));

    await waitFor(() => expect(result.current.groupedPermissions).not.toEqual({})); // Wait for permissions to load

    const permission = mockPermissions[0];

    // Add permission
    act(() => {
      result.current.handlePermissionToggle(permission);
    });

    expect(result.current.formData.permissions).toContain(permission.id);

    // Remove permission
    act(() => {
      result.current.handlePermissionToggle(permission);
    });

    expect(result.current.formData.permissions).not.toContain(permission.id);
  });

  it('should clear error when requested', async () => {
    const { result } = renderHook(() => useRoleDialog(undefined));

    await waitFor(() => expect(result.current.groupedPermissions).not.toEqual({}));

    act(() => {
      result.current.setError('Some error');
    });

    expect(result.current.error).toBe('Some error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeUndefined();
  });

  it('should update form data when role prop changes', async () => {
    const { result, rerender } = renderHook(
      (props) => useRoleDialog(props),
      { initialProps: undefined as Role | undefined }
    );

    await waitFor(() => expect(result.current.groupedPermissions).not.toEqual({}));

    // Initial state
    expect(result.current.formData.name).toBe('');

    // Update with role
    rerender(mockRole);

    expect(result.current.formData).toEqual({
      name: mockRole.name,
      description: mockRole.description,
      active: mockRole.active,
      permissions: mockRole.permissions
    });

    // Update back to undefined
    rerender(undefined);

    expect(result.current.formData).toEqual({
      name: '',
      description: '',
      active: true,
      permissions: []
    });
  });
});
