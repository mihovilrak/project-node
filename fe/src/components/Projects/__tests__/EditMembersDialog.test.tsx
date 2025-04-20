import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditMembersDialog from '../EditMembersDialog';
import { getUsers } from '../../../api/users';
import { User } from '../../../types/user';
import { ProjectMember } from '../../../types/project';

jest.mock('../../../api/users');
const mockGetUsers = getUsers as jest.MockedFunction<typeof getUsers>;

const mockUsers: User[] = [
  {
    id: 1,
    login: 'user1',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    role_id: 1,
    status_id: 1,
    created_on: '2024-01-01',
    updated_on: null,
    last_login: null
  },
  {
    id: 2,
    login: 'user2',
    name: 'Jane',
    surname: 'Smith',
    email: 'jane@example.com',
    role_id: 1,
    status_id: 1,
    created_on: '2024-01-01',
    updated_on: null,
    last_login: null
  }
];

const mockCurrentMembers: ProjectMember[] = [
  {
    project_id: 1,
    user_id: 1,
    role: "Admin",
    created_on: '2024-01-01',
    name: 'John',
    surname: 'Doe'
  }
];

describe('EditMembersDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    mockGetUsers.mockResolvedValue(mockUsers);
    jest.clearAllMocks();
  });

  it('renders dialog with user list', async () => {
    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Project Members')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles user selection and deselection', async () => {
    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const checkbox = screen.getAllByRole('checkbox')[1]; // Jane Smith's checkbox
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('handles API error', async () => {
    mockGetUsers.mockRejectedValueOnce(new Error('API Error'));

    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });

  it('saves selected members', async () => {
    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith([1]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes dialog on cancel', async () => {
    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});