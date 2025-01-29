import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserTable from '../UserTable';
import { User } from '../../../types/user';
import { deleteUser } from '../../../api/users';

// Mock the deleteUser API call
jest.mock('../../../api/users', () => ({
  deleteUser: jest.fn()
}));

const mockUsers: User[] = [
  {
    id: 1,
    login: 'johndoe',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    role_id: 1,
    status_id: 1,
    role: 'Admin',
    timezone: null,
    language: null,
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
    role: 'Reporter',
    timezone: null,
    language: null,
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
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  test('displays user data correctly', () => {
    renderUserTable();
    expect(screen.getByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('handles pagination', () => {
    renderUserTable();
    const rowsPerPageSelect = screen.getByLabelText('Rows per page:');
    fireEvent.mouseDown(rowsPerPageSelect);
    fireEvent.click(screen.getByText('25'));
    expect(screen.getByText('1-2 of 2')).toBeInTheDocument();
  });

  test('calls onEditUser when edit button is clicked', () => {
    renderUserTable();
    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);
    expect(mockOnEditUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('shows delete confirmation dialog', () => {
    renderUserTable();
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText(/Are you sure you want to delete user/)).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  test('handles user deletion', async () => {
    (deleteUser as jest.Mock).mockResolvedValueOnce(undefined);
    renderUserTable();
    
    // Click delete button
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith(1);
      expect(mockOnUserDeleted).toHaveBeenCalled();
    });
  });

  test('handles deletion error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (deleteUser as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));
    
    renderUserTable();
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete user:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('closes delete dialog when cancel is clicked', () => {
    renderUserTable();
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText(/Are you sure you want to delete user/)).not.toBeInTheDocument();
  });
});