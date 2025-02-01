import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../TestWrapper';
import { api } from '../../api/api';
import { User } from '../../types/user';
import Users from '../../components/Users/Users';
import UserForm from '../../components/Users/UserForm';

// Mock the API calls
jest.mock('../../api/api');
const mockedApi = api as jest.Mocked<typeof api>;

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    const newUser = { ...mockUser, id: 2 };
    mockedApi.post.mockResolvedValueOnce({ data: newUser });
    mockedApi.get.mockResolvedValueOnce({ data: [] }); // Initial users list
    mockedApi.get.mockResolvedValueOnce({ data: [newUser] }); // Updated users list

    render(
      <TestWrapper>
        <Users />
      </TestWrapper>
    );

    // Click create user button
    const createButton = await screen.findByRole('button', { name: /create user/i });
    await userEvent.click(createButton);

    // Fill in the form
    const loginInput = screen.getByLabelText(/login/i);
    const nameInput = screen.getByLabelText(/first name/i);
    const surnameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const roleSelect = screen.getByLabelText(/role/i);

    await userEvent.type(loginInput, 'testuser');
    await userEvent.type(nameInput, 'Test');
    await userEvent.type(surnameInput, 'User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.selectOptions(roleSelect, '2');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(submitButton);

    // Verify API call
    expect(mockedApi.post).toHaveBeenCalledWith('/users', expect.objectContaining({
      login: 'testuser',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com',
      role_id: 2
    }));

    // Verify user appears in the list
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  it('should update user profile', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [mockUser] });
    mockedApi.put.mockResolvedValueOnce({ 
      data: { ...mockUser, name: 'Updated', surname: 'Name' } 
    });

    render(
      <TestWrapper>
        <Users />
      </TestWrapper>
    );

    // Click edit button for the user
    const editButton = await screen.findByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Update the form
    const nameInput = screen.getByLabelText(/first name/i);
    const surnameInput = screen.getByLabelText(/last name/i);

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated');
    await userEvent.clear(surnameInput);
    await userEvent.type(surnameInput, 'Name');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(submitButton);

    // Verify API call
    expect(mockedApi.put).toHaveBeenCalledWith('/users/1', expect.objectContaining({
      name: 'Updated',
      surname: 'Name'
    }));

    // Verify updated name appears
    await waitFor(() => {
      expect(screen.getByText('Updated Name')).toBeInTheDocument();
    });
  });

  it('should manage user roles', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [mockUser] });
    mockedApi.get.mockResolvedValueOnce({ data: ['User', 'Admin'] }); // roles
    mockedApi.put.mockResolvedValueOnce({ data: { ...mockUser, role: 'Admin', role_id: 1 } });

    render(
      <TestWrapper>
        <Users />
      </TestWrapper>
    );

    // Click manage roles button
    const manageRolesButton = await screen.findByRole('button', { name: /manage roles/i });
    await userEvent.click(manageRolesButton);

    // Change role
    const roleSelect = screen.getByLabelText(/role/i);
    await userEvent.selectOptions(roleSelect, '1'); // Admin role

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Verify API call
    expect(mockedApi.put).toHaveBeenCalledWith('/users/1/roles', { roles: [1] });

    // Verify role update
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('should delete a user', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [mockUser] });
    mockedApi.delete.mockResolvedValueOnce({});

    render(
      <TestWrapper>
        <Users />
      </TestWrapper>
    );

    // Click delete button
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    // Verify API call
    expect(mockedApi.delete).toHaveBeenCalledWith('/users/1');

    // Verify user is removed from list
    await waitFor(() => {
      expect(screen.queryByText('testuser')).not.toBeInTheDocument();
    });
  });

  it('should search and filter users', async () => {
    const users = [
      mockUser,
      { ...mockUser, id: 2, login: 'admin', role: 'Admin' },
      { ...mockUser, id: 3, login: 'manager', role: 'Manager' }
    ];
    
    mockedApi.get.mockResolvedValueOnce({ data: users });

    render(
      <TestWrapper>
        <Users />
      </TestWrapper>
    );

    // Search for user
    const searchInput = await screen.findByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'admin');

    // Verify filtered results
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.queryByText('testuser')).not.toBeInTheDocument();
    });

    // Filter by role
    const roleFilter = screen.getByLabelText(/filter by role/i);
    await userEvent.selectOptions(roleFilter, 'Admin');

    // Verify filtered results
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.queryByText('manager')).not.toBeInTheDocument();
    });
  });
});
