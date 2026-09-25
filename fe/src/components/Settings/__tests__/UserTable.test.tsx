import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import UserTable from '../UserTable';
import { User } from '../../../types/user';
import { changeUserStatus, deleteUser } from '../../../api/users';
import logger from '../../../utils/logger';

// Mock the deleteUser API call
jest.mock('../../../api/users', () => ({
  deleteUser: jest.fn(),
  changeUserStatus: jest.fn(),
}));

// Mock activityTypes API to prevent getAvailableIcons errors
jest.mock('../../../api/activityTypes', () => ({
  getAvailableIcons: jest.fn().mockResolvedValue([]),
}));

// Mock Material-UI components that might cause testing issues
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Tooltip: ({ children }: { children: React.ReactNode }) => children,
  };
});

const mockUsers: User[] = [
  {
    id: 1,
    login: 'johndoe',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    role_id: 1,
    status_id: 1,
    role_name: 'Admin',
    avatar_url: null,
    created_on: '2023-01-01',
    updated_on: null,
    last_login: null,
  },
  {
    id: 2,
    login: 'janesmith',
    name: 'Jane',
    surname: 'Smith',
    email: 'jane@example.com',
    role_id: 4,
    status_id: 1,
    role_name: 'Reporter',
    avatar_url: null,
    created_on: '2023-01-01',
    updated_on: null,
    last_login: null,
  },
];

describe('UserTable', () => {
  const mockOnEditUser = jest.fn();
  const mockOnUserDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderUserTable = () => {
    return render(
      <UserTable
        users={mockUsers}
        onEditUser={mockOnEditUser}
        onUserDeleted={mockOnUserDeleted}
      />,
    );
  };

  test('renders table with correct headers', () => {
    renderUserTable();
    // Using role-based queries for table headers
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Login');
    expect(headers[1]).toHaveTextContent('Name');
    expect(headers[2]).toHaveTextContent('Email');
    expect(headers[3]).toHaveTextContent('Role');
  });

  test('displays user data correctly', () => {
    renderUserTable();
    // Get the table by its data-testid
    const table = screen.getByTestId('user-table');
    const cells = within(table).getAllByRole('cell');

    // Find cells containing the expected text (avoiding direct text matching)
    expect(cells.some((cell) => cell.textContent === 'johndoe')).toBe(true);
    expect(cells.some((cell) => cell.textContent === 'John Doe')).toBe(true);
    expect(cells.some((cell) => cell.textContent === 'john@example.com')).toBe(
      true,
    );

    // For the Chip component, use a more specific approach
    const adminChip = screen.getByText('Admin');
    expect(adminChip).toBeInTheDocument();
  });

  test('renders pagination component', () => {
    renderUserTable();

    // Verify pagination component is rendered
    const pagination = screen.getByTestId('pagination');
    expect(pagination).toBeInTheDocument();

    // Check that the pagination contains rows per page selector
    const rowsPerPageText = within(pagination).getByText(/rows per page/i);
    expect(rowsPerPageText).toBeInTheDocument();

    // Verify that pagination shows correct total count
    expect(pagination.textContent).toContain(`${mockUsers.length}`);
  });

  test('has functional pagination controls', () => {
    // Create a test case with more users to make pagination meaningful
    const manyUsers = [...Array(25)].map((_, index) => ({
      id: index + 1,
      login: `user${index}`,
      name: `User`,
      surname: `${index}`,
      email: `user${index}@example.com`,
      role_id: 1,
      status_id: 1,
      role_name: 'User',
      avatar_url: null,
      created_on: '2023-01-01',
      updated_on: null,
      last_login: null,
    }));

    // Render with custom users array
    render(
      <UserTable
        users={manyUsers}
        onEditUser={mockOnEditUser}
        onUserDeleted={mockOnUserDeleted}
      />,
    );

    // Get the pagination component
    const pagination = screen.getByTestId('pagination');
    expect(pagination).toBeInTheDocument();

    // Verify pagination controls exist
    const paginationButtons = within(pagination).getAllByRole('button');
    expect(paginationButtons.length).toBeGreaterThan(0);

    // Check that the component correctly displays the number of users
    expect(pagination.textContent).toContain(String(manyUsers.length));
  });

  test('calls onEditUser when edit button is clicked', () => {
    renderUserTable();
    // Using data-testid to find the edit button
    const editButton = screen.getByTestId('edit-user-1');
    fireEvent.click(editButton);
    expect(mockOnEditUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('shows delete confirmation dialog', () => {
    renderUserTable();
    // Using data-testid to find the delete button
    const deleteButton = screen.getByTestId('delete-user-1');
    fireEvent.click(deleteButton);

    // Check that dialog content is displayed using data-testid
    const dialogContent = screen.getByTestId('delete-confirmation-text');
    expect(dialogContent).toHaveTextContent(
      /Are you sure you want to delete user/,
    );
    expect(dialogContent).toHaveTextContent(/John/);
  });

  test('handles user deletion', async () => {
    (deleteUser as jest.Mock).mockResolvedValueOnce(undefined);
    renderUserTable();

    // Click delete button using data-testid
    const deleteButton = screen.getByTestId('delete-user-1');
    fireEvent.click(deleteButton);

    // Wait for the dialog to be fully rendered
    await waitFor(() => {
      expect(
        screen.getByTestId('delete-confirmation-text'),
      ).toBeInTheDocument();
    });

    // Find the confirm button in the dialog by data-testid and click it
    const confirmButton = screen.getByTestId('confirm-delete-button');
    fireEvent.click(confirmButton);

    // Wait for the deleteUser to be called and onUserDeleted callback triggered
    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith(1);
      expect(mockOnUserDeleted).toHaveBeenCalled();
    });
  });

  test('handles deletion error and shows error message', async () => {
    const errorMessage = 'Delete failed';
    (deleteUser as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    renderUserTable();
    // Find delete button by data-testid
    const deleteButton = screen.getByTestId('delete-user-1');
    fireEvent.click(deleteButton);

    // Wait for the dialog to appear
    await waitFor(() => {
      expect(
        screen.getByTestId('delete-confirmation-text'),
      ).toBeInTheDocument();
    });

    // Find and click the dialog's delete button by data-testid
    const confirmButton = screen.getByTestId('confirm-delete-button');
    fireEvent.click(confirmButton);

    // Wait for the error message to appear in the dialog
    await waitFor(
      () => {
        expect(screen.getByTestId('delete-error')).toBeInTheDocument();
        // Error message uses error.message if available, otherwise falls back to default
        expect(screen.getByTestId('delete-error')).toHaveTextContent(
          /Delete failed|Failed to delete user/i,
        );
      },
      { timeout: 3000 },
    );

    // Verify error was logged
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to delete user:',
      expect.any(Error),
    );

    // Verify dialog stays open (doesn't close on error)
    expect(screen.getByTestId('delete-confirmation-text')).toBeInTheDocument();

    // Verify onUserDeleted was NOT called (since deletion failed)
    expect(mockOnUserDeleted).not.toHaveBeenCalled();
  });

  test('treats a 404 on delete as already deleted', async () => {
    (deleteUser as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404, data: { error: 'User not found' } },
    });
    renderUserTable();

    fireEvent.click(screen.getByTestId('delete-user-1'));
    fireEvent.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => {
      expect(mockOnUserDeleted).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('delete-error')).not.toBeInTheDocument();
    expect(logger.error).not.toHaveBeenCalled();
  });

  test('moves back a page when the last page empties', () => {
    const manyUsers = Array.from({ length: 11 }, (_, i) => ({
      ...mockUsers[1],
      id: i + 1,
      login: `user${i + 1}`,
    }));
    const { rerender } = render(
      <UserTable
        users={manyUsers}
        onEditUser={mockOnEditUser}
        onUserDeleted={mockOnUserDeleted}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(screen.getByText('user11')).toBeInTheDocument();

    rerender(
      <UserTable
        users={manyUsers.slice(0, 10)}
        onEditUser={mockOnEditUser}
        onUserDeleted={mockOnUserDeleted}
      />,
    );
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user10')).toBeInTheDocument();
  });

  test('shows loading state while deleting', async () => {
    (deleteUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    renderUserTable();
    const deleteButton = screen.getByTestId('delete-user-1');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByTestId('delete-confirmation-text'),
      ).toBeInTheDocument();
    });

    const confirmButton = screen.getByTestId('confirm-delete-button');
    fireEvent.click(confirmButton);

    // Check that button shows "Deleting..." and is disabled
    await waitFor(() => {
      expect(confirmButton).toHaveTextContent('Deleting...');
      expect(confirmButton).toBeDisabled();
    });

    // Wait for deletion to complete
    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalled();
    });
  });

  test('closes delete dialog when cancel is clicked', async () => {
    renderUserTable();
    // Find delete button by data-testid
    const deleteButton = screen.getByTestId('delete-user-1');
    fireEvent.click(deleteButton);

    // Wait for the dialog to appear
    await waitFor(
      () => {
        expect(
          screen.getByTestId('delete-confirmation-text'),
        ).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // Find and click the cancel button by data-testid
    const cancelButton = screen.getByTestId('cancel-delete-button');
    fireEvent.click(cancelButton);

    // Check that the dialog is closed
    await waitFor(
      () => {
        expect(
          screen.queryByTestId('delete-confirmation-text'),
        ).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  }, 15000);

  describe('status actions', () => {
    const inactiveUser: User = {
      ...mockUsers[1],
      id: 3,
      login: 'old',
      name: 'Old',
      surname: 'Timer',
      status_id: 2,
      status_name: 'Inactive',
    };
    const onUserUpdated = jest.fn();
    const renderWithStatus = () =>
      render(
        <UserTable
          users={[...mockUsers, inactiveUser]}
          onEditUser={mockOnEditUser}
          onUserDeleted={mockOnUserDeleted}
          onUserUpdated={onUserUpdated}
          currentUserId={1}
        />,
      );

    test("hides status and delete actions on the current user's row", () => {
      renderWithStatus();
      expect(screen.queryByTestId('status-user-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-user-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('edit-user-1')).toBeInTheDocument();
    });

    test('shows the status of each user', () => {
      renderWithStatus();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    test('deactivates a user after confirmation', async () => {
      (changeUserStatus as jest.Mock).mockResolvedValueOnce({});
      renderWithStatus();

      fireEvent.click(
        screen.getByRole('button', { name: 'Deactivate Jane Smith' }),
      );
      expect(changeUserStatus).not.toHaveBeenCalled();
      expect(screen.getByText('Deactivate user')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));

      await waitFor(() => expect(changeUserStatus).toHaveBeenCalledWith(2, 2));
      expect(onUserUpdated).toHaveBeenCalled();
    });

    test('activates an inactive user without confirmation', async () => {
      (changeUserStatus as jest.Mock).mockResolvedValueOnce({});
      renderWithStatus();

      fireEvent.click(
        screen.getByRole('button', { name: 'Activate Old Timer' }),
      );

      await waitFor(() => expect(changeUserStatus).toHaveBeenCalledWith(3, 1));
      expect(onUserUpdated).toHaveBeenCalled();
    });

    test('shows status change errors', async () => {
      (changeUserStatus as jest.Mock).mockRejectedValueOnce({
        response: { data: { error: 'User not found' } },
      });
      renderWithStatus();

      fireEvent.click(
        screen.getByRole('button', { name: 'Activate Old Timer' }),
      );

      expect(await screen.findByText('User not found')).toBeInTheDocument();
      expect(onUserUpdated).not.toHaveBeenCalled();
    });
  });
});
