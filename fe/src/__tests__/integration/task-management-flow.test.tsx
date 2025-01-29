import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../TestWrapper';
import Tasks from '../../components/Tasks/Tasks';
import { api } from '../../api/api';
import { Task } from '../../types/task';
import { Comment } from '../../types/comment';
import { TaskFile } from '../../types/file';
import { TaskWatcher } from '../../types/watcher';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';

// Mock the API calls
jest.mock('../../api/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Task Management Flow', () => {
  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    project_id: 1,
    project_name: 'Test Project',
    holder_id: 1,
    holder_name: 'Test Holder',
    assignee_id: 2,
    assignee_name: 'Test Assignee',
    parent_id: null,
    parent_name: null,
    description: 'Test Description',
    type_id: 1,
    type_name: 'Feature',
    status_id: 1,
    status_name: 'To Do',
    priority_id: 1,
    priority_name: 'High',
    start_date: '2025-01-25',
    due_date: '2025-02-25',
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test Creator',
    created_on: '2025-01-25',
    estimated_time: 8
  };

  const mockComment: Comment = {
    id: 1,
    task_id: 1,
    comment: 'Test comment',
    user_id: 1,
    user_name: 'Test User',
    created_on: '2025-01-25',
    updated_on: null,
    active: true
  };

  const mockFile: TaskFile = {
    id: 1,
    task_id: 1,
    user_id: 1,
    original_name: 'test.txt',
    name: 'test.txt',
    size: 1024,
    mime_type: 'text/plain',
    uploaded_by: 'Test User',
    uploaded_on: '2025-01-25'
  };

  const mockWatcher: TaskWatcher = {
    task_id: 1,
    user_id: 3,
    user_name: 'Test Watcher',
    role: 'Developer'
  };

  const mockTimeLog: TimeLog = {
    id: 1,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    log_date: '2025-01-25',
    spent_time: 4,
    description: 'Development work',
    created_on: '2025-01-25',
    updated_on: null,
    activity_type_name: 'Development',
    activity_type_color: '#4CAF50',
    activity_type_icon: 'code'
  };

  const mockSubtask: Task = {
    id: 2,
    name: 'Test Subtask',
    project_id: 1,
    project_name: 'Test Project',
    holder_id: 1,
    holder_name: 'Test Holder',
    assignee_id: 2,
    assignee_name: 'Test Assignee',
    parent_id: 1,
    parent_name: 'Test Task',
    description: 'Subtask Description',
    type_id: 1,
    type_name: 'Feature',
    status_id: 1,
    status_name: 'To Do',
    priority_id: 1,
    priority_name: 'High',
    start_date: '2025-01-25',
    due_date: '2025-02-25',
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test Creator',
    created_on: '2025-01-25',
    estimated_time: 4
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default API responses
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/tasks') {
        return Promise.resolve({ data: [mockTask] });
      }
      if (url.includes('/comments')) {
        return Promise.resolve({ data: [mockComment] });
      }
      if (url.includes('/files')) {
        return Promise.resolve({ data: [mockFile] });
      }
      if (url.includes('/watchers')) {
        return Promise.resolve({ data: [mockWatcher] });
      }
      if (url.includes('/time-logs/tasks/')) {
        return Promise.resolve({ data: [mockTimeLog] });
      }
      if (url.includes('/subtasks')) {
        return Promise.resolve({ data: [mockSubtask] });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('should create a task with attachments', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    mockedApi.post.mockResolvedValueOnce({ data: mockTask });

    // Click create task button
    const createButton = screen.getByRole('button', { name: /create task/i });
    await userEvent.click(createButton);

    // Fill in the task form
    const nameInput = screen.getByLabelText(/name/i);
    const descInput = screen.getByLabelText(/description/i);
    await userEvent.type(nameInput, 'Test Task');
    await userEvent.type(descInput, 'Test Description');

    // Upload attachment
    const fileInput = screen.getByLabelText(/upload file/i);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    await userEvent.upload(fileInput, file);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    expect(mockedApi.post).toHaveBeenCalledWith('tasks', expect.objectContaining({
      name: 'Test Task',
      description: 'Test Description'
    }));

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
  });

  it('should transition task status', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock status update
    const updatedTask = { ...mockTask, status_id: 2, status_name: 'In Progress' };
    mockedApi.put.mockResolvedValueOnce({ data: updatedTask });

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Change status
    const statusButton = screen.getByRole('button', { name: /to do/i });
    await userEvent.click(statusButton);
    
    const newStatus = screen.getByText(/in progress/i);
    await userEvent.click(newStatus);

    expect(mockedApi.put).toHaveBeenCalledWith(
      'tasks/1',
      expect.objectContaining({ status_id: 2 })
    );

    await waitFor(() => {
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });

  it('should assign and reassign tasks', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock assignee update
    const updatedTask = { ...mockTask, assignee_id: 3, assignee_name: 'New Assignee' };
    mockedApi.put.mockResolvedValueOnce({ data: updatedTask });

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Change assignee
    const assigneeSelect = screen.getByLabelText(/assignee/i);
    await userEvent.click(assigneeSelect);
    const newAssignee = screen.getByText('New Assignee');
    await userEvent.click(newAssignee);

    expect(mockedApi.put).toHaveBeenCalledWith(
      'tasks/1',
      expect.objectContaining({ assignee_id: 3 })
    );

    await waitFor(() => {
      expect(screen.getByText('New Assignee')).toBeInTheDocument();
    });
  });

  it('should add and manage task comments', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock comment creation
    mockedApi.post.mockResolvedValueOnce({ data: mockComment });

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Add comment
    const commentInput = screen.getByPlaceholderText(/add a comment/i);
    await userEvent.type(commentInput, 'Test comment');
    const submitComment = screen.getByRole('button', { name: /submit comment/i });
    await userEvent.click(submitComment);

    expect(mockedApi.post).toHaveBeenCalledWith(
      'tasks/1/comments',
      expect.objectContaining({ content: 'Test comment' })
    );

    await waitFor(() => {
      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });
  });

  it('should manage task dependencies', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    const dependentTask = { ...mockTask, id: 2, name: 'Dependent Task', parent_id: 1 };
    mockedApi.post.mockResolvedValueOnce({ data: dependentTask });

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Add subtask
    const addSubtaskButton = screen.getByRole('button', { name: /add subtask/i });
    await userEvent.click(addSubtaskButton);

    // Fill in subtask details
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, 'Dependent Task');
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    expect(mockedApi.post).toHaveBeenCalledWith('tasks', expect.objectContaining({
      name: 'Dependent Task',
      parent_id: 1
    }));

    await waitFor(() => {
      expect(screen.getByText('Dependent Task')).toBeInTheDocument();
    });
  });

  it('should filter and search tasks', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock filtered results
    const filteredTasks = [{ ...mockTask, priority_id: 1 }];
    mockedApi.get.mockResolvedValueOnce({ data: filteredTasks });

    // Apply priority filter
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await userEvent.click(filterButton);
    
    const priorityFilter = screen.getByLabelText(/priority/i);
    await userEvent.click(priorityFilter);
    const highPriority = screen.getByText(/high/i);
    await userEvent.click(highPriority);

    expect(mockedApi.get).toHaveBeenCalledWith(
      expect.stringContaining('priority=1')
    );

    // Search for task
    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'Test Task');

    expect(mockedApi.get).toHaveBeenCalledWith(
      expect.stringContaining('search=Test%20Task')
    );

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('should add and remove task watchers', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock watcher management API calls
    mockedApi.post.mockResolvedValueOnce({ data: mockWatcher });
    mockedApi.delete.mockResolvedValueOnce({ data: {} });

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Open watchers dialog
    const manageWatchersButton = screen.getByRole('button', { name: /manage watchers/i });
    await userEvent.click(manageWatchersButton);

    // Add new watcher
    const addWatcherButton = screen.getByRole('button', { name: /add watcher/i });
    await userEvent.click(addWatcherButton);
    
    const userSelect = screen.getByLabelText(/select user/i);
    await userEvent.click(userSelect);
    const newWatcher = screen.getByText('Test Watcher');
    await userEvent.click(newWatcher);

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/tasks/1/watchers',
      { userId: 3 }
    );

    await waitFor(() => {
      expect(screen.getByText('Test Watcher')).toBeInTheDocument();
    });

    // Remove watcher
    const removeButton = screen.getByRole('button', { name: /remove Test Watcher/i });
    await userEvent.click(removeButton);

    expect(mockedApi.delete).toHaveBeenCalledWith('/tasks/1/watchers/3');

    await waitFor(() => {
      expect(screen.queryByText('Test Watcher')).not.toBeInTheDocument();
    });
  });

  it('should load and display task watchers', async () => {
    // Mock initial watchers fetch
    mockedApi.get.mockResolvedValueOnce({ data: [mockWatcher] });

    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Open watchers dialog
    const manageWatchersButton = screen.getByRole('button', { name: /manage watchers/i });
    await userEvent.click(manageWatchersButton);

    expect(mockedApi.get).toHaveBeenCalledWith('/tasks/1/watchers');

    await waitFor(() => {
      expect(screen.getByText('Test Watcher')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });
  });

  it('should log time for a task', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock time log creation
    mockedApi.post.mockResolvedValueOnce({ data: mockTimeLog });

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Open time log dialog
    const logTimeButton = screen.getByRole('button', { name: /log time/i });
    await userEvent.click(logTimeButton);

    // Fill in time log form
    const spentTimeInput = screen.getByLabelText(/spent time/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const activityTypeSelect = screen.getByLabelText(/activity type/i);

    await userEvent.type(spentTimeInput, '4');
    await userEvent.type(descriptionInput, 'Development work');
    await userEvent.click(activityTypeSelect);
    const developmentOption = screen.getByText('Development');
    await userEvent.click(developmentOption);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    const expectedTimeLog: TimeLogCreate = {
      task_id: 1,
      activity_type_id: 1,
      log_date: expect.any(String),
      spent_time: 4,
      description: 'Development work'
    };

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/time-logs/tasks/1/logs',
      expectedTimeLog
    );

    await waitFor(() => {
      expect(screen.getByText('4h')).toBeInTheDocument();
      expect(screen.getByText('Development work')).toBeInTheDocument();
    });
  });

  it('should edit and delete time logs', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock time log update and delete
    const updatedTimeLog = { ...mockTimeLog, spent_time: 6, description: 'Updated work' };
    mockedApi.put.mockResolvedValueOnce({ data: updatedTimeLog });
    mockedApi.delete.mockResolvedValueOnce({ data: {} });

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Find and click edit button on time log
    const editButton = screen.getByRole('button', { name: /edit time log/i });
    await userEvent.click(editButton);

    // Update time log
    const spentTimeInput = screen.getByLabelText(/spent time/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await userEvent.clear(spentTimeInput);
    await userEvent.type(spentTimeInput, '6');
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'Updated work');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    expect(mockedApi.put).toHaveBeenCalledWith(
      '/time-logs/1',
      expect.objectContaining({
        spent_time: 6,
        description: 'Updated work'
      })
    );

    // Delete time log
    const deleteButton = screen.getByRole('button', { name: /delete time log/i });
    await userEvent.click(deleteButton);

    expect(mockedApi.delete).toHaveBeenCalledWith('/time-logs/1');

    await waitFor(() => {
      expect(screen.queryByText('Development work')).not.toBeInTheDocument();
    });
  });

  it('should display time log statistics', async () => {
    // Mock time logs data
    const mockTimeLogs = [
      { ...mockTimeLog },
      { ...mockTimeLog, id: 2, spent_time: 2, activity_type_name: 'Testing' }
    ];
    mockedApi.get.mockResolvedValueOnce({ data: mockTimeLogs });

    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    expect(mockedApi.get).toHaveBeenCalledWith('/time-logs/tasks/1/logs');

    await waitFor(() => {
      // Check total time
      expect(screen.getByText('6h')).toBeInTheDocument();
      // Check activity breakdown
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
    });
  });

  it('should create and manage subtasks', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock subtask creation and fetching
    mockedApi.post.mockResolvedValueOnce({ data: mockSubtask });
    mockedApi.get.mockResolvedValueOnce({ data: [mockSubtask] });

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Click add subtask button
    const addSubtaskButton = screen.getByRole('button', { name: /add subtask/i });
    await userEvent.click(addSubtaskButton);

    // Fill in subtask form
    const nameInput = screen.getByLabelText(/name/i);
    const descInput = screen.getByLabelText(/description/i);
    await userEvent.type(nameInput, 'Test Subtask');
    await userEvent.type(descInput, 'Subtask Description');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    expect(mockedApi.post).toHaveBeenCalledWith('/tasks', expect.objectContaining({
      name: 'Test Subtask',
      description: 'Subtask Description',
      parent_id: 1
    }));

    // Verify subtask appears in list
    await waitFor(() => {
      expect(screen.getByText('Test Subtask')).toBeInTheDocument();
      expect(screen.getByText('Subtask Description')).toBeInTheDocument();
    });

    // Test editing subtask
    const updatedSubtask = { ...mockSubtask, name: 'Updated Subtask' };
    mockedApi.put.mockResolvedValueOnce({ data: updatedSubtask });

    const editButton = screen.getByRole('button', { name: /edit subtask/i });
    await userEvent.click(editButton);

    const editNameInput = screen.getByLabelText(/name/i);
    await userEvent.clear(editNameInput);
    await userEvent.type(editNameInput, 'Updated Subtask');

    const saveButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(saveButton);

    expect(mockedApi.put).toHaveBeenCalledWith('/tasks/2', expect.objectContaining({
      name: 'Updated Subtask'
    }));

    // Test deleting subtask
    mockedApi.delete.mockResolvedValueOnce({ data: {} });

    const deleteButton = screen.getByRole('button', { name: /delete subtask/i });
    await userEvent.click(deleteButton);

    expect(mockedApi.delete).toHaveBeenCalledWith('/tasks/2');

    await waitFor(() => {
      expect(screen.queryByText('Updated Subtask')).not.toBeInTheDocument();
    });
  });

  it('should load and display subtasks', async () => {
    // Mock multiple subtasks
    const mockSubtasks = [
      mockSubtask,
      { ...mockSubtask, id: 3, name: 'Another Subtask', priority_id: 2, priority_name: 'Medium' }
    ];
    mockedApi.get.mockResolvedValueOnce({ data: mockSubtasks });

    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    expect(mockedApi.get).toHaveBeenCalledWith('/tasks/1/subtasks');

    await waitFor(() => {
      // Verify both subtasks are displayed
      expect(screen.getByText('Test Subtask')).toBeInTheDocument();
      expect(screen.getByText('Another Subtask')).toBeInTheDocument();
      
      // Verify subtask details are shown
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('To Do')).toBeInTheDocument();
    });
  });

  it('should navigate to subtask details', async () => {
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);

    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Click on subtask to navigate
    const subtaskTitle = screen.getByText('Test Subtask');
    await userEvent.click(subtaskTitle);

    expect(navigate).toHaveBeenCalledWith('/tasks/2');
  });

  it('should handle subtask creation errors', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock subtask creation error
    const error = new Error('Failed to create subtask');
    mockedApi.post.mockRejectedValueOnce(error);

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Click add subtask button
    const addSubtaskButton = screen.getByRole('button', { name: /add subtask/i });
    await userEvent.click(addSubtaskButton);

    // Fill in subtask form
    const nameInput = screen.getByLabelText(/name/i);
    const descInput = screen.getByLabelText(/description/i);
    await userEvent.type(nameInput, 'Test Subtask');
    await userEvent.type(descInput, 'Subtask Description');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create subtask/i)).toBeInTheDocument();
    });
  });

  it('should handle subtask deletion errors', async () => {
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock initial subtask fetch
    mockedApi.get.mockResolvedValueOnce({ data: [mockSubtask] });

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    // Mock deletion error
    const error = new Error('Failed to delete subtask');
    mockedApi.delete.mockRejectedValueOnce(error);

    // Try to delete subtask
    const deleteButton = screen.getByRole('button', { name: /delete subtask/i });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to delete subtask/i)).toBeInTheDocument();
      // Verify subtask is still in the list
      expect(screen.getByText('Test Subtask')).toBeInTheDocument();
    });
  });

  it('should handle subtask loading errors', async () => {
    // Mock subtask loading error
    const error = new Error('Failed to fetch subtasks');
    mockedApi.get.mockRejectedValueOnce(error);

    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Open task details
    const taskCard = screen.getByText('Test Task');
    await userEvent.click(taskCard);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch subtasks/i)).toBeInTheDocument();
      expect(screen.getByText(/no subtasks found/i)).toBeInTheDocument();
    });
  });
});
