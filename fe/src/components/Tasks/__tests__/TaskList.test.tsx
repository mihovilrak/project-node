import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthProvider from '../../../context/AuthContext';
import TaskList from '../TaskList';
import { getTasks, deleteTask } from '../../../api/tasks';
import { Task } from '../../../types/task';
import logger from '../../../utils/logger';

// Mock the API calls
jest.mock('../../../api/tasks');
const mockedGetTasks = getTasks as jest.MockedFunction<typeof getTasks>;
const mockedDeleteTask = deleteTask as jest.MockedFunction<typeof deleteTask>;

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

// Mock usePermission to always grant permission
jest.mock('../../../hooks/common/usePermission', () => ({
  usePermission: () => ({ hasPermission: true, loading: false })
}));

// Mock sample tasks
const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Test Task 1',
    description: 'Description 1',
    project_id: 1,
    project_name: 'Project 1',
    holder_id: 1,
    holder_name: 'Holder 1',
    assignee_id: 2,
    assignee_name: 'Assignee 1',
    parent_id: null,
    parent_name: null,
    type_id: 1,
    type_name: 'Task',
    status_id: 1,
    status_name: 'In Progress',
    priority_id: 1,
    priority_name: 'High/Should',
    start_date: '2023-01-01',
    due_date: '2023-12-31',
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Creator 1',
    created_on: '2023-01-01',
    estimated_time: 8
  },
  {
    id: 2,
    name: 'Test Task 2',
    description: 'Description 2',
    project_id: 1,
    project_name: 'Project 1',
    holder_id: 1,
    holder_name: 'Holder 1',
    assignee_id: 2,
    assignee_name: 'Assignee 2',
    parent_id: null,
    parent_name: null,
    type_id: 1,
    type_name: 'Task',
    status_id: 2,
    status_name: 'Done',
    priority_id: 2,
    priority_name: 'Normal/Could',
    start_date: '2023-01-01',
    due_date: '2023-12-31',
    end_date: null,
    spent_time: 0,
    progress: 100,
    created_by: 1,
    created_by_name: 'Creator 1',
    created_on: '2023-01-01',
    estimated_time: 8
  }
];

const renderTaskList = () => {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <TaskList />
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('TaskList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially', () => {
    mockedGetTasks.mockImplementation(() => new Promise(() => {}));
    renderTaskList();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders tasks successfully', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Assignee: Assignee 1')).toBeInTheDocument();
  });

  test('handles task deletion', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    mockedDeleteTask.mockResolvedValue();

    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const deleteButtons = await screen.findAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Wait for delete confirmation dialog to appear
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete task/)).toBeInTheDocument();
    });

    // Click confirm button in dialog
    const confirmButton = screen.getByTestId('confirm-delete-button');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedDeleteTask).toHaveBeenCalledWith(1);
    });
  });

  test('navigates to task details when clicking Details button', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const detailsButtons = await screen.findAllByText('Details');
    fireEvent.click(detailsButtons[0]);

    expect(mockedNavigate).toHaveBeenCalledWith('/tasks/1');
  });

  test('navigates to edit task when clicking Edit button', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Find Edit buttons by text content (PermissionButton uses aria-label for tooltip, not button name)
    const editButtonTexts = await screen.findAllByText('Edit');
    // Click the button element (the text's parent)
    const editButton = editButtonTexts[0].closest('button')!;
    fireEvent.click(editButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/tasks/1/edit');
  });

  test('displays error handling when API call fails', async () => {
    mockedGetTasks.mockRejectedValue(new Error('API Error'));

    renderTaskList();

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Failed to fetch tasks:', expect.any(Error));
    }, { timeout: 8000 });
  });

  test('renders correct chip colors based on status and priority', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTaskList();

    await waitFor(() => {
      // Get all Chip roots by their label text, then go up to the parent (Chip root)
      const statusChipLabels = screen.getAllByText(/Done|In Progress/);
      const priorityChipLabels = screen.getAllByText(/High\/Should|Normal\/Could/);
      // The parentElement of the label span is the Chip root
      const statusChips = statusChipLabels.map(label => label.parentElement);
      const priorityChips = priorityChipLabels.map(label => label.parentElement);
      expect(statusChips[1]).toHaveClass('MuiChip-colorSuccess'); // Done status
      expect(priorityChips[0]).toHaveClass('MuiChip-colorWarning'); // High/Should priority
    });
  });

  test('handles tasks with no due date', async () => {
    const tasksWithNoDueDate = [{ ...mockTasks[0], due_date: null }];
    mockedGetTasks.mockResolvedValue(tasksWithNoDueDate);

    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('Due: -')).toBeInTheDocument();
    });
  });

  test('handles tasks with no assignee', async () => {
    const tasksWithNoAssignee = [{ ...mockTasks[0], assignee_name: '' }];
    mockedGetTasks.mockResolvedValue(tasksWithNoAssignee);

    renderTaskList();

    await waitFor(() => {
      expect(screen.getByText('Assignee: Unassigned')).toBeInTheDocument();
    });
  });
});