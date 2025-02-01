import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import ProjectMemberSelect from '../ProjectMemberSelect';
import { User } from '../../../types/user';

const mockUsers: User[] = [
  {
    id: 1,
    login: 'john.doe',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    role_id: 1,
    status_id: 1,
    avatar_url: null,
    created_on: '2024-01-01',
    updated_on: null,
    last_login: null,
    role_name: 'Developer'
  },
  {
    id: 2,
    login: 'jane.smith',
    name: 'Jane',
    surname: 'Smith',
    email: 'jane@example.com',
    role_id: 2,
    status_id: 1,
    avatar_url: null,
    created_on: '2024-01-01',
    updated_on: null,
    last_login: null,
    role_name: 'Project Manager'
  }
];

const mockSelectedUsers = [1];

describe('ProjectMemberSelect', () => {
  const mockOnUserSelect = jest.fn();

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={'light'}>
        <ProjectMemberSelect
          users={mockUsers}
          selectedUsers={mockSelectedUsers}
          onUserSelect={mockOnUserSelect}
          {...props}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all users', () => {
    renderComponent();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows correct role for each user', () => {
    renderComponent();
    expect(screen.getByText('Role: Developer')).toBeInTheDocument();
    expect(screen.getByText('Role: Project Manager')).toBeInTheDocument();
  });

  it('shows correct checkbox state for selected users', () => {
    renderComponent();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('calls onUserSelect when clicking a user', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Jane Smith'));
    expect(mockOnUserSelect).toHaveBeenCalledWith(2);
  });
});