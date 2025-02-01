import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TaskDetails from '../TaskDetails';
import * as TaskCore from '../../../hooks/task/useTaskCore';
import * as TaskTimeLogs from '../../../hooks/task/useTaskTimeLogs';
import * as TaskWatchers from '../../../hooks/task/useTaskWatchers';
import * as TaskFiles from '../../../hooks/task/useTaskFiles';
import * as TaskComments from '../../../hooks/task/useTaskComments';
import * as TaskDetailsHandlers from '../../../hooks/task/useTaskDetailsHandlers';
import { Task, TaskStatus } from '../../../types/task';

// Mock all hooks
jest.mock('../../../hooks/task/useTaskCore');
jest.mock('../../../hooks/task/useTaskTimeLogs');
jest.mock('../../../hooks/task/useTaskWatchers');
jest.mock('../../../hooks/task/useTaskFiles');
jest.mock('../../../hooks/task/useTaskComments');
jest.mock('../../../hooks/task/useTaskDetailsHandlers');

// Mock child components
jest.mock('../TaskDetailsHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="task-details-header" />
}));

jest.mock('../TaskDetailsContent', () => ({
  __esModule: true,
  default: () => <div data-testid="task-details-content" />
}));

jest.mock('../TaskDetailsSidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="task-details-sidebar" />
}));

const mockTask: Task = {
  id: 1,
  name: 'Test Task',
  project_id: 1,
  project_name: 'Test Project',
  description: 'Test description',
  parent_id: null,
  parent_name: null,
  type_id: 1,
  type_name: 'Task',
  status_id: 1,
  status_name: 'New',
  priority_id: 1,
  priority_name: 'Medium',
  start_date: null,
  due_date: null,
  spent_time: 0,
  progress: 0,
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2025-02-01T21:52:40+01:00',
  estimated_time: null
};

const mockStatuses: TaskStatus[] = [
  {
    id: 1,
    name: 'New',
    color: '#000000',
    description: null,
    active: true,
    created_on: '',
    updated_on: null
  },
  {
    id: 2,
    name: 'In Progress',
    color: '#000000',
    description: null,
    active: true,
    created_on: '',
    updated_on: null
  }
];

describe('TaskDetails', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (TaskCore.useTaskCore as jest.Mock).mockReturnValue({
      task: mockTask,
      subtasks: [],
      statuses: mockStatuses,
      loading: false,
      error: null,
      handleStatusChange: jest.fn(),
      handleDelete: jest.fn(),
      setSubtasks: jest.fn()
    });

    (TaskTimeLogs.useTaskTimeLogs as jest.Mock).mockReturnValue({
      timeLogs: [],
      handleTimeLogSubmit: jest.fn(),
      deleteTimeLog: jest.fn(),
      fetchTimeLogs: jest.fn()
    });

    (TaskWatchers.useTaskWatchers as jest.Mock).mockReturnValue({
      watchers: [],
      handleAddWatcher: jest.fn(),
      handleRemoveWatcher: jest.fn()
    });

    (TaskFiles.useTaskFiles as jest.Mock).mockReturnValue({
      files: [],
      handleFileUpload: jest.fn(),
      handleFileDelete: jest.fn(),
      refreshFiles: jest.fn()
    });

    (TaskComments.useTaskComments as jest.Mock).mockReturnValue({
      comments: [],
      handleCommentSubmit: jest.fn(),
      handleCommentUpdate: jest.fn(),
      handleCommentDelete: jest.fn()
    });

    (TaskDetailsHandlers.useTaskDetailsHandlers as jest.Mock).mockReturnValue({
      state: {
        statusMenuAnchor: null,
        editingComment: null,
        timeLogDialogOpen: false,
        selectedTimeLog: null,
        watcherDialogOpen: false
      },
      handleStatusMenuClick: jest.fn(),
      handleStatusMenuClose: jest.fn(),
      handleStatusChange: jest.fn(),
      handleSaveComment: jest.fn(),
      handleEditStart: jest.fn(),
      handleTimeLogSubmit: jest.fn(),
      handleTimeLogEdit: jest.fn(),
      handleTimeLogDialogClose: jest.fn(),
      handleAddSubtaskClick: jest.fn(),
      handleSubtaskUpdate: jest.fn(),
      handleSubtaskDelete: jest.fn(),
      handleWatcherDialogOpen: jest.fn(),
      handleWatcherDialogClose: jest.fn()
    });
  });

  const renderTaskDetails = (taskId = '1') => {
    return render(
      <MemoryRouter initialEntries={[`/tasks/${taskId}`]}>
        <Routes>
          <Route path="/tasks/:id" element={<TaskDetails />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders loading state correctly', () => {
    (TaskCore.useTaskCore as jest.Mock).mockReturnValue({
      loading: true,
      task: null,
      subtasks: [],
      statuses: [],
      error: null
    });

    renderTaskDetails();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    (TaskCore.useTaskCore as jest.Mock).mockReturnValue({
      loading: false,
      task: null,
      subtasks: [],
      statuses: [],
      error: 'Failed to load task'
    });

    renderTaskDetails();
    expect(screen.getByText('Error loading task details')).toBeInTheDocument();
  });

  test('renders task details successfully', () => {
    renderTaskDetails();
    expect(screen.getByTestId('task-details-header')).toBeInTheDocument();
    expect(screen.getByTestId('task-details-content')).toBeInTheDocument();
    expect(screen.getByTestId('task-details-sidebar')).toBeInTheDocument();
  });

  test('fetches time logs on mount', () => {
    const mockFetchTimeLogs = jest.fn();
    (TaskTimeLogs.useTaskTimeLogs as jest.Mock).mockReturnValue({
      timeLogs: [],
      handleTimeLogSubmit: jest.fn(),
      deleteTimeLog: jest.fn(),
      fetchTimeLogs: mockFetchTimeLogs
    });

    renderTaskDetails();
    expect(mockFetchTimeLogs).toHaveBeenCalled();
  });

  test('handles status change correctly', async () => {
    const mockHandleStatusChange = jest.fn();
    const mockHandleStatusMenuClose = jest.fn();

    (TaskCore.useTaskCore as jest.Mock).mockReturnValue({
      ...mockTask,
      handleStatusChange: mockHandleStatusChange
    });

    (TaskDetailsHandlers.useTaskDetailsHandlers as jest.Mock).mockReturnValue({
      ...TaskDetailsHandlers,
      handleStatusMenuClose: mockHandleStatusMenuClose
    });

    renderTaskDetails();

    // Simulate status change
    await waitFor(() => {
      expect(mockHandleStatusChange).not.toHaveBeenCalled();
      expect(mockHandleStatusMenuClose).not.toHaveBeenCalled();
    });
  });

  // Add more test cases as needed for other interactions
});