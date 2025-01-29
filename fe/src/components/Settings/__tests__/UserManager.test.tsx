import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManager from '../UserManager';
import { getUsers } from '../../../api/users';
import { User } from '../../../types/user';

// Mock the API calls
jest.mock('../../../api/users');

// Mock the child components
jest.mock('../UserTable', () => ({
  __esModule: true,
  default: ({ users, onEditUser, onUserDeleted }: any) => (
    <div data-testid="user-table">
      {users.map((user: User) => (
        <div key={user.id} data-testid="user-row">
          <span>{user.name}</span>
          <button onClick={() => onEditUser(user)}>Edit</button>
          <button onClick={onUserDeleted}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../UserDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onUserSaved }: any) => (
    open ? (
      <div data-testid="user-dialog">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onUserSaved()}>Save</button>
      </div>
    ) : null
  ),
}));

const mockUsers: User[] = [
  {
    id: 1,
    login: 'john.doe',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    role_id: 1,
    status_id: 1,
    timezone: 'UTC',
    language: 'en',
    avatar_url: null,
    created_on: '2024-01-01T00:00:00Z',
    updated_on: null,
    last_login: null,
  },
  {
    id: 2,
    login: 'jane.smith',
    name: 'Jane',
    surname: 'Smith',
    email: 'jane@example.com',
    role_id: 2,
    status_id: 1,
    timezone: 'UTC',
    language: 'en',
    avatar_url: null,
    created_on: '2024-01-01T00:00:00Z',
    updated_on: null,
    last_login: null,
  },
];

describe('UserManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (getUsers as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<UserManager />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays users after successful loading', async () => {
    (getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);
    render(<UserManager />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByTestId('user-table')).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    (getUsers as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    render(<UserManager />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
    });
  });

  it('opens dialog for creating new user', () => {
    (getUsers as jest.Mock).mockResolvedValueOnce([]);
    render(<UserManager />);

    fireEvent.click(screen.getByText('Create User'));
    
    expect(screen.getByTestId('user-dialog')).toBeInTheDocument();
  });

  it('opens dialog for editing user', async () => {
    (getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);
    render(<UserManager />);

    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    expect(screen.getByTestId('user-dialog')).toBeInTheDocument();
  });

  it('refreshes user list after successful save', async () => {
    (getUsers as jest.Mock)
      .mockResolvedValueOnce(mockUsers)
      .mockResolvedValueOnce([...mockUsers, {
        id: 3,
        login: 'new.user',
        name: 'New',
        surname: 'User',
        email: 'new@example.com',
        role_id: 3,
        status_id: 1,
        timezone: 'UTC',
        language: 'en',
        avatar_url: null,
        created_on: '2024-01-01T00:00:00Z',
        updated_on: null,
        last_login: null,
      }]);

    render(<UserManager />);

    // Open create dialog
    fireEvent.click(screen.getByText('Create User'));
    
    // Save new user
    await waitFor(() => {
      fireEvent.click(screen.getByText('Save'));
    });

    // Verify that getUsers was called twice
    expect(getUsers).toHaveBeenCalledTimes(2);
  });

  it('closes dialog when Close button is clicked', async () => {
    (getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);
    render(<UserManager />);

    // Open create dialog
    fireEvent.click(screen.getByText('Create User'));
    
    // Close dialog
    fireEvent.click(screen.getByText('Close'));

    expect(screen.queryByTestId('user-dialog')).not.toBeInTheDocument();
  });
});