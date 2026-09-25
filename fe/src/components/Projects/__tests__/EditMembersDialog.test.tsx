import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditMembersDialog from '../EditMembersDialog';
import { getUserOptions } from '../../../api/users';
import { UserOption } from '../../../types/user';
import { ProjectMember } from '../../../types/project';

jest.mock('../../../api/users');
const mockGetUserOptions = getUserOptions as jest.MockedFunction<
  typeof getUserOptions
>;

const mockUsers: UserOption[] = [
  { id: 1, login: 'user1', name: 'John', surname: 'Doe' },
  { id: 2, login: 'user2', name: 'Jane', surname: 'Smith' },
];

const mockCurrentMembers: ProjectMember[] = [
  {
    project_id: 1,
    user_id: 1,
    role: 'Admin',
    created_on: '2024-01-01',
    name: 'John',
    surname: 'Doe',
  },
];

describe('EditMembersDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserOptions.mockResolvedValue(mockUsers);
  });

  it('renders dialog with user list', async () => {
    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />,
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
      />,
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
    mockGetUserOptions.mockRejectedValueOnce(new Error('API Error'));

    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />,
    );

    await waitFor(
      () => {
        // Error message uses error.message if available, otherwise falls back to default
        expect(screen.getByText('API Error')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('saves selected members', async () => {
    mockOnSave.mockResolvedValue(undefined);
    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith([1]);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('keeps the dialog open and shows the error when saving fails', async () => {
    mockOnSave.mockRejectedValue(new Error('Save failed'));
    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Save Changes'));

    expect(await screen.findByText('Save failed')).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('loads user options once', async () => {
    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    expect(mockGetUserOptions).toHaveBeenCalledTimes(1);
  });

  it('closes dialog on cancel', async () => {
    render(
      <EditMembersDialog
        open={true}
        onClose={mockOnClose}
        currentMembers={mockCurrentMembers}
        onSave={mockOnSave}
        projectId={1}
      />,
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
