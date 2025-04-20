import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    within
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Tasks from '../Tasks';
import { getTasks, deleteTask } from '../../../api/tasks';
import { Task } from '../../../types/task';
import userEvent from '@testing-library/user-event';

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
      <Tasks />
    </MemoryRouter>
  );
};

describe('Tasks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    expect(screen.getByText('Project: Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project: Project 2')).toBeInTheDocument();
  });

  test('handles task deletion', async () => {
    window.confirm = jest.fn(() => true);
    mockedGetTasks.mockResolvedValue(mockTasks);
    mockedDeleteTask.mockResolvedValue();

    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const deleteButtons = await screen.findAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    
    await waitFor(() => {
      expect(mockedDeleteTask).toHaveBeenCalledWith(1);
      expect(mockedGetTasks).toHaveBeenCalledTimes(2); // Initial load + after delete
    });
  });

  test('handles failed task deletion', async () => {
    window.confirm = jest.fn(() => true);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockedGetTasks.mockResolvedValue(mockTasks);
    mockedDeleteTask.mockRejectedValue(new Error('Delete failed'));

    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const deleteButtons = await screen.findAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete task', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('filters tasks by search term', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    const filterPanel = screen.getByTestId('filter-panel');
    // Expand the filter panel to reveal the search input
    const expandButton = within(filterPanel).getByRole('button');
    fireEvent.click(expandButton);
    const searchInput = within(filterPanel).getByRole('textbox', { name: /search/i });
    
    await userEvent.type(searchInput, 'Task 1');

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
  });

  test('sorts tasks correctly', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    
    // Test descending sort
    await userEvent.click(sortSelect);
    await userEvent.click(screen.getByText('Z-A'));

    const taskElements = screen.getAllByRole('heading', { level: 6 });
    expect(taskElements[0]).toHaveTextContent('Test Task 2');
    expect(taskElements[1]).toHaveTextContent('Test Task 1');
  });

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

    // Test details navigation
    const detailsButtons = screen.getAllByText('Details');
    fireEvent.click(detailsButtons[0]);
    expect(mockedNavigate).toHaveBeenCalledWith('/tasks/1');

    // Test edit navigation
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    expect(mockedNavigate).toHaveBeenCalledWith('/tasks/1/edit');
  });

  test('displays correct status and priority chips', async () => {
    mockedGetTasks.mockResolvedValue(mockTasks);
    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    // Check status chip
    const statusChips = screen.getAllByTestId('status-chip');
    expect(statusChips.length).toBeGreaterThan(0);

    // Check priority chip
    const priorityChips = screen.getAllByTestId('priority-chip');
    expect(priorityChips.length).toBeGreaterThan(0);
  });

  test('handles empty assignee correctly', async () => {
    mockedGetTasks.mockResolvedValue([mockTasks[1]]);
    renderTasks();

    await waitFor(() => {
      expect(screen.getByText('Assignee: Unassigned')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetTasks.mockRejectedValue(new Error('API error'));
    
    renderTasks();

    await waitFor(() => {
      expect(screen.getByTestId('task-error')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });
});