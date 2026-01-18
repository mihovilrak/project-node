import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import UserTable from '../UserTable';
import { User } from '../../../types/user';
import { deleteUser } from '../../../api/users';

// Mock the deleteUser API call
jest.mock('../../../api/users', () => ({
  deleteUser: jest.fn()
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
    last_login: null
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
    last_login: null
  }
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
      />
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
    expect(cells.some(cell => cell.textContent === 'johndoe')).toBe(true);
    expect(cells.some(cell => cell.textContent === 'John Doe')).toBe(true);
    expect(cells.some(cell => cell.textContent === 'john@example.com')).toBe(true);

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
      last_login: null
    }));

    // Render with custom users array
    render(
      <UserTable
        users={manyUsers}
        onEditUser={mockOnEditUser}
        onUserDeleted={mockOnUserDeleted}
      />
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
    expect(dialogContent).toHaveTextContent(/Are you sure you want to delete user/);
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
      expect(screen.getByTestId('delete-confirmation-text')).toBeInTheDocument();
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

  test('handles deletion error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (deleteUser as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

    renderUserTable();
    // Find delete button by data-testid
    const deleteButton = screen.getByTestId('delete-user-1');
    fireEvent.click(deleteButton);

    // Wait for the dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId('delete-confirmation-text')).toBeInTheDocument();
    });

    // Find and click the dialog's delete button by data-testid
    const confirmButton = screen.getByTestId('confirm-delete-button');
    fireEvent.click(confirmButton);

    // Wait for the error to be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete user:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('closes delete dialog when cancel is clicked', async () => {
    renderUserTable();
    // Find delete button by data-testid
    const deleteButton = screen.getByTestId('delete-user-1');
    fireEvent.click(deleteButton);

    // Wait for the dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId('delete-confirmation-text')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Find and click the cancel button by data-testid
    const cancelButton = screen.getByTestId('cancel-delete-button');
    fireEvent.click(cancelButton);

    // Check that the dialog is closed
    await waitFor(() => {
      expect(screen.queryByTestId('delete-confirmation-text')).not.toBeInTheDocument();
    }, { timeout: 10000 });
  }, 15000);
});