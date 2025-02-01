import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Users from '../Users';
import { getUsers, deleteUser } from '../../../api/users';
import { User } from '../../../types/user';

// Mock the API calls
jest.mock('../../../api/users');
const mockedGetUsers = getUsers as jest.MockedFunction<typeof getUsers>;
const mockedDeleteUser = deleteUser as jest.MockedFunction<typeof deleteUser>;

// Mock the navigate function
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock the FilterPanel component
jest.mock('../../common/FilterPanel', () => {
  return function MockFilterPanel({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
    return (
      <div data-testid="filter-panel">
        <input
          data-testid="search-input"
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>
    );
  };
});

const mockUsers: User[] = [
  {
    id: 1,
    login: 'user1',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    role_id: 1,
    status_id: 1,
    avatar_url: null,
    created_on: '2023-01-01',
    updated_on: null,
    last_login: null,
    role_name: 'Admin'
  },
  {
    id: 2,
    login: 'user2',
    name: 'Jane',
    surname: 'Smith',
    email: 'jane@example.com',
    role_id: 4,
    status_id: 1,
    avatar_url: null,
    created_on: '2023-01-01',
    updated_on: null,
    last_login: null,
    role_name: 'Reporter'
  }
];

describe('Users Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetUsers.mockResolvedValue(mockUsers);
  });

  const renderUsers = () =>
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

  test('shows loading state initially', () => {
    renderUsers();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders users list after loading', async () => {
    renderUsers();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('handles user filtering', async () => {
    renderUsers();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  test('handles sort order change', async () => {
    renderUsers();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('button');
    fireEvent.mouseDown(sortSelect);
    const descOption = screen.getByText('Z-A');
    fireEvent.click(descOption);

    const users = screen.getAllByRole('heading', { level: 6 });
    expect(users[0]).toHaveTextContent('Jane Smith');
    expect(users[1]).toHaveTextContent('John Doe');
  });

  test('handles user deletion', async () => {
    window.confirm = jest.fn(() => true);
    mockedDeleteUser.mockResolvedValue(undefined);

    renderUsers();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockedDeleteUser).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  test('handles navigation', async () => {
    renderUsers();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByText('Add New User');
    fireEvent.click(addButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/users/new');

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);
    expect(mockedNavigate).toHaveBeenCalledWith('/users/1');

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    expect(mockedNavigate).toHaveBeenCalledWith('/users/1/edit');
  });

  test('handles API error', async () => {
    console.error = jest.fn();
    mockedGetUsers.mockRejectedValue(new Error('API Error'));

    renderUsers();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(console.error).toHaveBeenCalledWith('Failed to fetch users', expect.any(Error));
  });
});