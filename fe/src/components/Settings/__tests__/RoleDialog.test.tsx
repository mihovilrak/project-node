import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoleDialog from '../RoleDialog';
import { useRoleDialog } from '../../../hooks/setting/useRoleDialog';
import { Role } from '../../../types/role';
import { Permission } from '../../../types/admin';

jest.mock('../../../hooks/setting/useRoleDialog');

const mockUseRoleDialog = useRoleDialog as jest.MockedFunction<typeof useRoleDialog>;

const mockRole: Role = {
  id: 1,
  name: 'Admin',
  description: 'Administrator role',
  active: true,
  permissions: [1, 2]
};

const mockGroupedPermissions: Record<string, Permission[]> = {
  project: [
    {
      id: 1,
      name: 'Create projects',
      created_on: '2025-01-01'
    },
    {
      id: 2,
      name: 'Edit projects',
      created_on: '2025-01-01'
    }
  ],
  task: [
    {
      id: 3,
      name: 'Create tasks',
      created_on: '2025-01-01'
    },
    {
      id: 4,
      name: 'Edit tasks',
      created_on: '2025-01-01'
    }
  ]
};

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  onSave: jest.fn().mockResolvedValue(undefined)
};

describe('RoleDialog', () => {
  beforeEach(() => {
    mockUseRoleDialog.mockReturnValue({
      formData: {
        name: '',
        description: '',
        active: true,
        permissions: []
      },
      error: undefined,
      groupedPermissions: mockGroupedPermissions,
      handleChange: jest.fn(),
      handlePermissionToggle: jest.fn(),
      clearError: jest.fn(),
      setError: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders create role dialog', () => {
    render(<RoleDialog {...defaultProps} />);
    expect(screen.getByText('Create Role')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  test('renders edit role dialog', () => {
    render(<RoleDialog {...defaultProps} role={mockRole} />);
    expect(screen.getByText('Edit Role')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  test('handles form submission successfully', async () => {
    render(<RoleDialog {...defaultProps} />);

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  test('when editing a role, calls onSave with role id so backend updates existing record', async () => {
    mockUseRoleDialog.mockReturnValue({
      formData: {
        name: 'Updated Role Name',
        description: 'Updated desc',
        active: true,
        permissions: [1, 2]
      },
      error: undefined,
      groupedPermissions: mockGroupedPermissions,
      handleChange: jest.fn(),
      handlePermissionToggle: jest.fn(),
      clearError: jest.fn(),
      setError: jest.fn()
    });

    render(<RoleDialog {...defaultProps} role={mockRole} />);

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockRole.id,
          name: 'Updated Role Name',
          description: 'Updated desc',
          active: true,
          permissions: [1, 2]
        })
      );
    });
  });

  test('handles form submission error', async () => {
    const errorMessage = 'Failed to save role';
    defaultProps.onSave.mockRejectedValueOnce({
      response: { data: { error: errorMessage } }
    });

    const mockSetError = jest.fn();
    mockUseRoleDialog.mockReturnValue({
      formData: {
        name: '',
        description: '',
        active: true,
        permissions: []
      },
      error: undefined,
      groupedPermissions: mockGroupedPermissions,
      handleChange: jest.fn(),
      handlePermissionToggle: jest.fn(),
      clearError: jest.fn(),
      setError: mockSetError
    });

    render(<RoleDialog {...defaultProps} />);

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('closes dialog on cancel', () => {
    render(<RoleDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});