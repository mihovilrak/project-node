import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WatcherDialog from '../WatcherDialog';
import { getProjectMembers } from '../../../api/projects';
import { ProjectMember } from '../../../types/project';
import { TaskWatcher } from '../../../types/watcher';

// Mock the API call
jest.mock('../../../api/projects');

const mockProjectMembers: ProjectMember[] = [
  {
    project_id: 1,
    user_id: 1,
    name: 'John',
    surname: 'Doe',
    role: 'Developer',
    created_on: '2024-01-01T00:00:00Z',
  },
  {
    project_id: 1,
    user_id: 2,
    name: 'Jane',
    surname: 'Smith',
    role: 'Project Manager',
    created_on: '2024-01-01T00:00:00Z',
  },
];

const mockCurrentWatchers: TaskWatcher[] = [
  { task_id: 1, user_id: 1, user_name: 'John Doe', role: 'Developer' },
];

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  projectId: 1,
  currentWatchers: mockCurrentWatchers,
  onAddWatcher: jest.fn(),
  onRemoveWatcher: jest.fn(),
};

describe('WatcherDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (getProjectMembers as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    );
    render(<WatcherDialog {...defaultProps} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays project members after loading', async () => {
    (getProjectMembers as jest.Mock).mockResolvedValueOnce(mockProjectMembers);
    render(<WatcherDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows the error when members fail to load', async () => {
    (getProjectMembers as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 403, data: {} },
    });

    render(<WatcherDialog {...defaultProps} />);

    expect(
      await screen.findByText(
        'You do not have permission to perform this action',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No project members available'),
    ).not.toBeInTheDocument();
  });

  it('adds a watcher once per checkbox click and blocks repeats in flight', async () => {
    (getProjectMembers as jest.Mock).mockResolvedValueOnce(mockProjectMembers);
    let resolveAdd: () => void = () => {};
    const onAddWatcher = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAdd = resolve;
        }),
    );
    render(<WatcherDialog {...defaultProps} onAddWatcher={onAddWatcher} />);

    const checkbox = await screen.findByRole('checkbox', {
      name: 'Watch: Jane Smith',
    });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByText('Jane Smith'));

    expect(onAddWatcher).toHaveBeenCalledTimes(1);
    expect(checkbox).toBeDisabled();

    resolveAdd();
    await waitFor(() => expect(checkbox).not.toBeDisabled());
  });

  it('calls onAddWatcher when adding a new watcher', async () => {
    (getProjectMembers as jest.Mock).mockResolvedValueOnce(mockProjectMembers);
    render(<WatcherDialog {...defaultProps} />);

    await waitFor(() => {
      const checkbox = screen.getAllByRole('checkbox')[1]; // Jane's checkbox
      fireEvent.click(checkbox);
    });

    expect(defaultProps.onAddWatcher).toHaveBeenCalledWith(2);
  });

  it('calls onRemoveWatcher when removing a watcher', async () => {
    (getProjectMembers as jest.Mock).mockResolvedValueOnce(mockProjectMembers);
    render(<WatcherDialog {...defaultProps} />);

    await waitFor(() => {
      const checkbox = screen.getAllByRole('checkbox')[0]; // John's checkbox
      fireEvent.click(checkbox);
    });

    expect(defaultProps.onRemoveWatcher).toHaveBeenCalledWith(1);
  });

  it('closes dialog when Close button is clicked', async () => {
    (getProjectMembers as jest.Mock).mockResolvedValueOnce(mockProjectMembers);
    render(<WatcherDialog {...defaultProps} />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows correct checkbox state for current watchers', async () => {
    (getProjectMembers as jest.Mock).mockResolvedValueOnce(mockProjectMembers);
    render(<WatcherDialog {...defaultProps} />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked(); // John's checkbox
      expect(checkboxes[1]).not.toBeChecked(); // Jane's checkbox
    });
  });

  it('does not fetch members when dialog is closed', () => {
    render(<WatcherDialog {...defaultProps} open={false} />);
    expect(getProjectMembers).not.toHaveBeenCalled();
  });
});
