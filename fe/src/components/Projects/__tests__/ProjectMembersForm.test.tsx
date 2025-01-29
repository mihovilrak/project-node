import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import ProjectMembersForm from '../ProjectMembersForm';
import { User } from '../../../types/user';

const mockUsers: User[] = [
  {
    id: 1,
    login: 'john.doe',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    role_id: 3,
    status_id: 1,
    timezone: 'UTC',
    language: 'en',
    avatar_url: null,
    created_on: '2024-01-01',
    updated_on: null,
    last_login: null,
    role: 'Developer'
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
    created_on: '2024-01-01',
    updated_on: null,
    last_login: null,
    role: 'Project Manager'
  }
];

describe('ProjectMembersForm', () => {
  const mockOnUserSelect = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSubmit = jest.fn();
  const theme = createTheme();

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <ProjectMembersForm
          users={mockUsers}
          selectedUsers={[1]}
          memberError=""
          onUserSelect={mockOnUserSelect}
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          {...props}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form title', () => {
    renderComponent();
    expect(screen.getByText('Project Members')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Please select at least one member';
    renderComponent({ memberError: errorMessage });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders back and create project buttons', () => {
    renderComponent();
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Back'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when create project button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Create Project'));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('passes correct props to ProjectMemberSelect', () => {
    renderComponent();
    const selectedUser = mockUsers[0];
    expect(screen.getByText(`${selectedUser.name} ${selectedUser.surname}`)).toBeInTheDocument();
    expect(screen.getByText(`Role: ${selectedUser.role}`)).toBeInTheDocument();
  });

  it('handles user selection through ProjectMemberSelect', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Jane Smith'));
    expect(mockOnUserSelect).toHaveBeenCalledWith(2);
  });
});