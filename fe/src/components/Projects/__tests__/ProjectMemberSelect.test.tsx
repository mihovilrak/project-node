import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectMemberSelect from '../ProjectMemberSelect';
import { UserOption } from '../../../types/user';

// Mock Material-UI components
jest.mock('@mui/material', () => {
  const originalModule = jest.requireActual('@mui/material');
  return {
    ...originalModule,
    Checkbox: ({ checked, ...props }: any) => (
      <input
        type="checkbox"
        data-testid="checkbox"
        checked={checked}
        {...props}
      />
    ),
    ListItem: ({ children, onClick, ...props }: any) => (
      <li onClick={onClick} data-testid="list-item" {...props}>
        {children}
      </li>
    ),
    ListItemIcon: ({ children }: any) => (
      <div data-testid="list-item-icon">{children}</div>
    ),
    ListItemText: ({ primary, secondary }: any) => (
      <div data-testid="list-item-text">
        <span data-testid="list-item-primary">{primary}</span>
        <span data-testid="list-item-secondary">{secondary}</span>
      </div>
    ),
    Paper: ({ children, ...props }: any) => (
      <div data-testid="paper" {...props}>
        {children}
      </div>
    ),
    Typography: ({ children, ...props }: any) => (
      <div data-testid="typography" {...props}>
        {children}
      </div>
    ),
    List: ({ children, ...props }: any) => (
      <ul data-testid="list" {...props}>
        {children}
      </ul>
    ),
  };
});

const mockUsers: UserOption[] = [
  { id: 1, login: 'john.doe', name: 'John', surname: 'Doe' },
  { id: 2, login: 'jane.smith', name: 'Jane', surname: 'Smith' },
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
      />,
    );

    // Check for user names using test ids
    const primaryTextElements = screen.getAllByTestId('list-item-primary');
    expect(primaryTextElements[0].textContent).toBe('John Doe');
    expect(primaryTextElements[1].textContent).toBe('Jane Smith');
  });

  it('shows the login for each user', () => {
    render(
      <ProjectMemberSelect
        users={mockUsers}
        selectedUsers={mockSelectedUsers}
        onUserSelect={mockOnUserSelect}
      />,
    );

    const secondaryTextElements = screen.getAllByTestId('list-item-secondary');
    expect(secondaryTextElements[0].textContent).toBe('john.doe');
    expect(secondaryTextElements[1].textContent).toBe('jane.smith');
  });

  it('shows correct checkbox state for selected users', () => {
    render(
      <ProjectMemberSelect
        users={mockUsers}
        selectedUsers={mockSelectedUsers}
        onUserSelect={mockOnUserSelect}
      />,
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
      />,
    );

    // Click on list items directly
    const listItems = screen.getAllByTestId('list-item');
    fireEvent.click(listItems[1]);

    expect(mockOnUserSelect).toHaveBeenCalledWith(2);
  });
});
