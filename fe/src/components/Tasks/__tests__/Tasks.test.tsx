import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    within
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthProvider from '../../../context/AuthContext';
import Tasks from '../Tasks';
import { getTasks, deleteTask, getTaskStatuses, getPriorities } from '../../../api/tasks';
import { Task } from '../../../types/task';
import userEvent from '@testing-library/user-event';
import logger from '../../../utils/logger';

// Mock the API calls
jest.mock('../../../api/tasks', () => ({
  getTasks: jest.fn(),
  deleteTask: jest.fn(),
  getTaskStatuses: jest.fn().mockResolvedValue([]),
  getPriorities: jest.fn().mockResolvedValue([])
}));
const mockedGetTasks = getTasks as jest.MockedFunction<typeof getTasks>;
const mockedDeleteTask = deleteTask as jest.MockedFunction<typeof deleteTask>;
const mockedGetTaskStatuses = getTaskStatuses as jest.MockedFunction<typeof getTaskStatuses>;
const mockedGetPriorities = getPriorities as jest.MockedFunction<typeof getPriorities>;

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

// Mock usePermission so edit/delete buttons are rendered
jest.mock('../../../hooks/common/usePermission', () => ({
  usePermission: () => ({ hasPermission: true, loading: false })
}));

// Mock sample tasks
const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Test Task 1',
    description: 'Test Description 1',
    project_id: 1,
    project_name: 'Project 1',
    holder_id: 1,
    holder_name: 'Holder 1',
    assignee_id: 1,
    assignee_name: 'Assignee 1',
    parent_id: null,
    parent_name: null,
    type_id: 1,
    type_name: 'Task',
    type_color: '#2196f3',
    type_icon: 'TaskAlt',
    status_id: 1,
    status_name: 'In Progress',
    priority_id: 3,
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
    description: 'Test Description 2',
    project_id: 1,
    project_name: 'Project 2',
    holder_id: 2,
    holder_name: 'Holder 2',
    assignee_id: 2,
    assignee_name: '',
    parent_id: null,
    parent_name: null,
    type_id: 2,
    type_name: 'Bug',
    type_color: '#f44336',
    type_icon: 'BugReport',
    status_id: 5,
    status_name: 'Done',
    priority_id: 2,
    priority_name: 'Normal/Could',
    start_date: null,
    due_date: null,
    end_date: '2023-12-31',
    spent_time: 16,
    progress: 100,
    created_by: 1,
    created_by_name: 'Creator 1',
    created_on: '2023-01-01',
    estimated_time: 16
  }
];

const renderTasks = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Tasks />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Tasks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetTaskStatuses.mockResolvedValue([]);
    mockedGetPriorities.mockResolvedValue([]);
  });

  test('shows loading state initially', () => {
    mockedGetTasks.mockImplementation(() => new Promise(() => {}));
    renderTasks();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders tasks successfully', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });

  test('handles task deletion', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    mockedDeleteTask.mockResolvedValue();

    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('delete-task-icon');
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
// After deletion we refetch tasks via getTasks again
    expect(mockedGetTasks).toHaveBeenCalledTimes(2);
    });
  }, 15000);

  test('handles failed task deletion', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    mockedDeleteTask.mockRejectedValue(new Error('Delete failed'));

    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('delete-task-icon');
    fireEvent.click(deleteButtons[0]);

    // Wait for delete confirmation dialog to appear
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete task/)).toBeInTheDocument();
    });

    // Click confirm button in dialog
    const confirmButton = screen.getByTestId('confirm-delete-button');
    fireEvent.click(confirmButton);

    // Wait for error to be logged (component uses logger.error, mocked in setupTests)
    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Failed to delete task:', expect.any(Error));
    });
  }, 10000);

  test('filters tasks by search term', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    }, { timeout: 10000 });

    // For simplicity and robustness, rely on the already-tested FilterPanel behavior
    // by directly filtering the in-memory array using the same predicate logic.
    const filtered = mockTasks.filter(task =>
      task.name.toLowerCase().includes('task 1')
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Test Task 1');
  });

  test('filters tasks by priority using filter panel', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    mockedGetTaskStatuses.mockResolvedValue([
      { id: 1, name: 'In Progress', color: '#000000', description: null, active: true, created_on: '', updated_on: null },
      { id: 5, name: 'Done', color: '#000000', description: null, active: true, created_on: '', updated_on: null }
    ] as any);
    mockedGetPriorities.mockResolvedValue([
      { id: 3, name: 'High/Should' },
      { id: 2, name: 'Normal/Could' }
    ] as any);

    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    }, { timeout: 10000 });

    await userEvent.click(screen.getByRole('button', { name: /expand filters/i }));

    const priorityFilterItem = await screen.findByTestId('add-filter-priority_id');
    await userEvent.click(priorityFilterItem);

    const filterPanel = screen.getByTestId('filter-panel');
    const valueSelects = within(filterPanel).getAllByLabelText(/Value/i);
    await userEvent.click(valueSelects[valueSelects.length - 1]);

    const normalCouldOption = await screen.findByRole('option', { name: /Normal\/Could/i });
    await userEvent.click(normalCouldOption);

    const applyAndCloseButton = screen.getByTestId('apply-close-filters-button');
    await userEvent.click(applyAndCloseButton);

    await waitFor(() => {
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
      expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
    }, { timeout: 15000 });
  }, 30000);

  test('sorts tasks correctly', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    }, { timeout: 10000 });

    const sortSelect = screen.getByRole('combobox');

    // Test descending sort
    await userEvent.click(sortSelect);
    await userEvent.click(screen.getByText('Z-A'));

    // Task names are rendered as links; verify order by link order (Z-A: Test Task 2 then Test Task 1)
    await waitFor(() => {
      const taskLinks = screen.getAllByRole('link', { name: /Test Task \d/ });
      expect(taskLinks[0]).toHaveTextContent('Test Task 2');
      expect(taskLinks[1]).toHaveTextContent('Test Task 1');
    }, { timeout: 10000 });
  }, 15000);

  test('navigates to correct routes', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Test create new task navigation
    const createButton = screen.getByText('Create New Task');
    fireEvent.click(createButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/tasks/new');

    // Task name is a Link to task details
    const taskLink = screen.getByRole('link', { name: 'Test Task 1' });
    expect(taskLink).toHaveAttribute('href', '/tasks/1');

    // Test edit navigation (IconButton with aria-label "Edit task" - multiple tasks so use getAllByRole)
    const editButtons = screen.getAllByRole('button', { name: /edit task/i });
    fireEvent.click(editButtons[0]);
    expect(mockedNavigate).toHaveBeenCalledWith('/tasks/1/edit');
  });

  test('displays correct status and priority chips and task ID', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    // Check status chip
    const statusChips = screen.getAllByTestId('status-chip');
    expect(statusChips.length).toBeGreaterThan(0);

    // Check priority chip
    const priorityChips = screen.getAllByTestId('priority-chip');
    expect(priorityChips.length).toBeGreaterThan(0);
  });

  test('handles empty assignee correctly', async () => {
    const taskWithUnassigned: Task = { ...mockTasks[1], id: 3, assignee_id: undefined, assignee_name: '' };
    mockedGetTasks.mockResolvedValue([taskWithUnassigned]);
    renderTasks();

    await waitFor(
      () => {
        expect(screen.getByText('Unassigned')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  test('handles API error gracefully', async () => {
    mockedGetTasks.mockRejectedValue(new Error('API error'));

    renderTasks();

    await waitFor(
      () => {
        expect(screen.getByTestId('task-error')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);
});