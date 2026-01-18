import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectMemberSelect from '../ProjectMemberSelect';
import { User } from '../../../types/user';

// Mock Material-UI components
jest.mock('@mui/material', () => {
  const originalModule = jest.requireActual('@mui/material');
  return {
    ...originalModule,
    Checkbox: ({ checked, ...props }: any) => (
      <input type="checkbox" data-testid="checkbox" checked={checked} {...props} />
    ),
    ListItem: ({ children, onClick, ...props }: any) => (
      <li onClick={onClick} data-testid="list-item" {...props}>{children}</li>
    ),
    ListItemIcon: ({ children }: any) => <div data-testid="list-item-icon">{children}</div>,
    ListItemText: ({ primary, secondary }: any) => (
      <div data-testid="list-item-text">
        <span data-testid="list-item-primary">{primary}</span>
        <span data-testid="list-item-secondary">{secondary}</span>
      </div>
    ),
    Paper: ({ children, ...props }: any) => <div data-testid="paper" {...props}>{children}</div>,
    Typography: ({ children, ...props }: any) => <div data-testid="typography" {...props}>{children}</div>,
    List: ({ children, ...props }: any) => <ul data-testid="list" {...props}>{children}</ul>
  };
});

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all users', () => {
    render(
      <ProjectMemberSelect
        users={mockUsers}
        selectedUsers={mockSelectedUsers}
        onUserSelect={mockOnUserSelect}
      />
    );

    // Check for user names using test ids
    const primaryTextElements = screen.getAllByTestId('list-item-primary');
    expect(primaryTextElements[0].textContent).toBe('John Doe');
    expect(primaryTextElements[1].textContent).toBe('Jane Smith');
  });

  it('shows correct role for each user', () => {
    render(
      <ProjectMemberSelect
        users={mockUsers}
        selectedUsers={mockSelectedUsers}
        onUserSelect={mockOnUserSelect}
      />
    );

    // Check for user roles using test ids
    const secondaryTextElements = screen.getAllByTestId('list-item-secondary');
    expect(secondaryTextElements[0].textContent).toBe('Role: Developer');
    expect(secondaryTextElements[1].textContent).toBe('Role: Project Manager');
  });

  it('shows correct checkbox state for selected users', () => {
    render(
      <ProjectMemberSelect
        users={mockUsers}
        selectedUsers={mockSelectedUsers}
        onUserSelect={mockOnUserSelect}
      />
    );

    // Get all checkboxes
    const checkboxes = screen.getAllByTestId('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('calls onUserSelect when clicking a user', () => {
    render(
      <ProjectMemberSelect
        users={mockUsers}
        selectedUsers={mockSelectedUsers}
        onUserSelect={mockOnUserSelect}
      />
    );

    // Click on list items directly
    const listItems = screen.getAllByTestId('list-item');
    fireEvent.click(listItems[1]);

    expect(mockOnUserSelect).toHaveBeenCalledWith(2);
  });
});