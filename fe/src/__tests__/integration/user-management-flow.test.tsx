import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../TestWrapper';
import { api } from '../../api/api';
import { User } from '../../types/user';
import Users from '../../components/Users/Users';
import * as usersApi from '../../api/users';

// Mock the API calls
jest.mock('../../api/api');
jest.mock('../../api/users');
const mockedApi = api as jest.Mocked<typeof api>;
const mockedUsersApi = usersApi as jest.Mocked<typeof usersApi>;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock usePermission so edit/delete buttons are rendered
jest.mock('../../hooks/common/usePermission', () => ({
  usePermission: () => ({ hasPermission: true, loading: false })
}));

describe('User Management Flow', () => {
  const mockUser: User = {
    id: 1,
    login: 'testuser',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    role_id: 2,
    status_id: 1,
    created_on: '2025-01-25',
    updated_on: null,
    last_login: null,
    role_name: 'Reporter',
    status_name: 'Active',
    status_color: 'green'
  };

  const mockUsers: User[] = [
    mockUser,
    { ...mockUser, id: 2, login: 'admin', name: 'Admin', surname: 'User', role_name: 'Admin' },
    { ...mockUser, id: 3, login: 'manager', name: 'Manager', surname: 'User', role_name: 'Manager' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for getUsers
    mockedUsersApi.getUsers.mockResolvedValue([mockUser]);
  });

  it('should display users list', async () => {
    mockedUsersApi.getUsers.mockResolvedValue([mockUser]);

    render(
      <TestWrapper>
        <Users />
      </TestWrapper>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify user is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Role: Reporter')).toBeInTheDocument();
  });

  it('should navigate to create user form', async () => {
    mockedUsersApi.getUsers.mockResolvedValue([mockUser]);

    render(
      <TestWrapper>
        <Users />
      </TestWrapper>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click Add New User button
    const addButton = screen.getByTestId('add-user-btn');
    await userEvent.click(addButton);

    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/users/new');
  });

  it('should navigate to edit user form', async () => {
    mockedUsersApi.getUsers.mockResolvedValue([mockUser]);

    render(
      <TestWrapper>
        <Users />
      </TestWrapper>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click Edit button
    const editButton = screen.getByTestId('edit-user-btn');
    await userEvent.click(editButton);

    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/users/1/edit');
  });

  it('should delete a user with confirmation', async () => {
    mockedUsersApi.getUsers.mockResolvedValue([mockUser]);
    mockedUsersApi.deleteUser.mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <Users />
      </TestWrapper>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click Delete button
    const deleteButton = screen.getByTestId('delete-user-1');
    await userEvent.click(deleteButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete user/)).toBeInTheDocument();
    });

    // Click confirm button in dialog
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(confirmButton);

    // Verify delete API was called
    await waitFor(() => {
      expect(mockedUsersApi.deleteUser).toHaveBeenCalledWith(1);
    });
  });

  it('should display multiple users and allow sorting', async () => {
    mockedUsersApi.getUsers.mockResolvedValue(mockUsers);

    render(
      <TestWrapper>
        <Users />
      </TestWrapper>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify all users are displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Manager User')).toBeInTheDocument();

    // Verify filter panel is present
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();

    // Verify sort select is present
    expect(screen.getByTestId('sort-select')).toBeInTheDocument();
  });
});
