import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Users from '../Users';
import { getUsers, deleteUser, getUserStatuses } from '../../../api/users';
import { User } from '../../../types/user';

// Mock the API calls
jest.mock('../../../api/users');
const mockedGetUsers = getUsers as jest.MockedFunction<typeof getUsers>;
const mockedDeleteUser = deleteUser as jest.MockedFunction<typeof deleteUser>;
const mockedGetUserStatuses = getUserStatuses as jest.MockedFunction<typeof getUserStatuses>;

// Mock the navigate function
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock the FilterPanel component
jest.mock('../../common/FilterPanel', () => {
  return ({ onFilterChange }: { onFilterChange: (filters: any) => void }) => {
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
    mockedGetUsers.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockUsers), 0))
    );
    mockedGetUserStatuses.mockResolvedValue([
      { id: 1, name: 'Active' },
      { id: 2, name: 'Inactive' },
      { id: 3, name: 'Deleted' }
    ]);
  });

  const renderUsers = () => {
    return render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
  };

  test('shows loading state initially', () => {
    renderUsers();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders users list after loading', async () => {
    await act(async () => {
      renderUsers();
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('handles user filtering', async () => {
    await act(async () => {
      renderUsers();
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  test('handles sort order change', async () => {
    let renderResult: ReturnType<typeof render>;
    await act(async () => {
      renderResult = renderUsers();
    });
    const { container } = renderResult!;
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const sortSelectTrigger = container.querySelector(
      'div[role="combobox"][aria-haspopup="listbox"]'
    );
    fireEvent.mouseDown(sortSelectTrigger!);
    const descOption = await screen.findByRole('option', { name: 'Z-A' });
    fireEvent.click(descOption);
    // Assert the select value changed
    const sortInput = screen.getByTestId('sort-select');
    expect(sortInput).toHaveValue('desc');
    // Assert both users are present
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('handles user deletion', async () => {
    mockedDeleteUser.mockResolvedValue(undefined);
    // After deletion, the component calls fetchUsers again, so mock should return filtered list
    mockedGetUsers
      .mockResolvedValueOnce(mockUsers) // Initial load
      .mockResolvedValueOnce(mockUsers.filter(u => u.id !== 1)); // After deletion

    await act(async () => {
      renderUsers();
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-user-1');
    await waitFor(() => {
      fireEvent.click(deleteButton);
    });

    // Wait for delete confirmation dialog to appear
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete user/)).toBeInTheDocument();
    });

    // Click confirm button in dialog
    const confirmButton = screen.getByTestId('confirm-delete-button');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedDeleteUser).toHaveBeenCalledWith(1);
    });
    
    // Wait for user to be removed from list (after API refresh)
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('handles navigation', async () => {
    await act(async () => {
      await renderUsers();
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Use data-testid for Add New User button if available, else robust text query
    const addButton = screen.getByTestId('add-user-btn') || screen.getByText('Add New User');
    fireEvent.click(addButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/users/new');

    // Use getAllByTestId for View/Edit/Delete if available, else fallback to getAllByText
    const viewButtons = screen.getAllByTestId('view-user-btn');
    const userCards = screen.getAllByRole('heading', { level: 6 });
    // Find the index where the card contains 'John Doe'
    const johnIndex = userCards.findIndex(card => card.textContent?.includes('John Doe'));
    fireEvent.click(viewButtons[johnIndex]);
    expect(mockedNavigate).toHaveBeenCalledWith('/users/1');

    const editButtons = screen.getAllByTestId('edit-user-btn');
    // Use the same index logic as the view button
    fireEvent.click(editButtons[johnIndex]);
    expect(mockedNavigate).toHaveBeenCalledWith('/users/1/edit');
  });

  test('handles API error', async () => {
    console.error = jest.fn();
    mockedGetUsers.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      renderUsers();
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(console.error).toHaveBeenCalledWith('Failed to fetch users', expect.any(Error));
  });
});