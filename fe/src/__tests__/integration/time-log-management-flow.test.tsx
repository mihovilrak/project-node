import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../TestWrapper';
import { TimeLog } from '../../types/timeLog';
import TaskTimeLogging from '../../components/Tasks/TaskTimeLogging';
import { api } from '../../api/api';
import dayjs from 'dayjs';

jest.mock('../../api/api');
const mockedApi = api as jest.Mocked<typeof api>;

jest.mock('../../hooks/timeLog/useTimeLogDialog', () => ({
  useTimeLogDialog: () => ({
    selectedProjectId: 1,
    selectedTaskId: 1,
    selectedUserId: 1,
    selectedActivityTypeId: 1,
    spentTime: '2',
    description: 'Test description',
    logDate: dayjs(),
    timeError: '',
    projects: [{ id: 1, name: 'Test Project' }],
    tasks: [{ id: 1, name: 'Test Task', project_id: 1 }],
    users: [{ id: 1, name: 'Test User' }],
    activityTypes: [{ id: 1, name: 'Development', color: '#4CAF50' }],
    isLoading: false,
    setSelectedProjectId: jest.fn(),
    setSelectedTaskId: jest.fn(),
    setSelectedUserId: jest.fn(),
    setSelectedActivityTypeId: jest.fn(),
    setSpentTime: jest.fn(),
    setDescription: jest.fn(),
    handleDateChange: jest.fn(),
    handleProjectChange: jest.fn(),
    handleTaskChange: jest.fn(),
    handleSubmit: jest.fn(),
  })
}));

// Mock the Permission check to always allow
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    currentUser: { id: 1, name: 'Test User' },
    isAuthenticated: true,
    hasPermission: () => true,
    loading: false,
    permissionsLoading: false,
    userPermissions: [{ permission: 'Admin' }]
  })
}));

describe('Time Log Integration Tests', () => {
  const mockTimeLog: TimeLog = {
    id: 1,
    task_id: 1,
    user_id: 1,
    log_date: '2024-01-01',
    spent_time: 2,
    description: 'Test time log description',
    activity_type_id: 1,
    created_on: '2024-01-01',
    updated_on: null,
    task_name: 'Test Task',
    project_name: 'Test Project',
    activity_type_name: 'Development',
    activity_type_color: '#4CAF50',
    user: 'Test User'
  };

  const mockTimeLogs: TimeLog[] = [
    mockTimeLog,
    {
      ...mockTimeLog,
      id: 2,
      spent_time: 4,
      description: 'Another time log',
      activity_type_name: 'Testing',
      activity_type_color: '#2196F3'
    }
  ];

  const defaultProps = {
    taskId: 1,
    projectId: 1,
    timeLogs: mockTimeLogs,
    timeLogDialogOpen: false,
    selectedTimeLog: null,
    onTimeLogSubmit: jest.fn(),
    onTimeLogDelete: jest.fn(),
    onTimeLogEdit: jest.fn(),
    onTimeLogDialogClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup API mock responses to prevent real HTTP calls
    mockedApi.get.mockImplementation((url: string) => {
      const normalizedUrl = url.startsWith('/') ? url.substring(1) : url;

      // Auth endpoints
      if (normalizedUrl === 'check-session') {
        return Promise.resolve({
          status: 200,
          data: { user: { id: 1, name: 'Test User' } }
        });
      }
      if (normalizedUrl === 'users/permissions') {
        return Promise.resolve({
          data: [{ permission: 'Admin' }]
        });
      }

      // Time log related endpoints
      if (normalizedUrl === 'activity-types') {
        return Promise.resolve({
          data: [
            { id: 1, name: 'Development', color: '#4CAF50' },
            { id: 2, name: 'Testing', color: '#2196F3' }
          ]
        });
      }
      if (normalizedUrl === 'projects') {
        return Promise.resolve({
          data: [{ id: 1, name: 'Test Project' }]
        });
      }
      if (normalizedUrl === 'users') {
        return Promise.resolve({
          data: [{ id: 1, name: 'Test User' }]
        });
      }
      if (normalizedUrl.match(/^projects\/\d+\/tasks$/)) {
        return Promise.resolve({
          data: [{ id: 1, name: 'Test Task', project_id: 1 }]
        });
      }

      // Default fallback
      return Promise.resolve({ data: {} });
    });

    mockedApi.post.mockResolvedValue({ data: {} });
    mockedApi.put.mockResolvedValue({ data: {} });
    mockedApi.delete.mockResolvedValue({ data: {} });
  });

  test('should display time logs correctly', async () => {
    render(
      <TestWrapper>
        <TaskTimeLogging {...defaultProps} />
      </TestWrapper>
    );

    // Verify time logs are displayed
    await waitFor(() => {
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
      expect(screen.getByText('Test time log description')).toBeInTheDocument();
      expect(screen.getByText('Another time log')).toBeInTheDocument();
    });
  });

  test('should display empty state when no time logs', async () => {
    render(
      <TestWrapper>
        <TaskTimeLogging {...defaultProps} timeLogs={[]} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No time logs found')).toBeInTheDocument();
    });
  });

  test('should call onTimeLogEdit when edit button is clicked', async () => {
    const onTimeLogEdit = jest.fn();

    render(
      <TestWrapper>
        <TaskTimeLogging {...defaultProps} onTimeLogEdit={onTimeLogEdit} />
      </TestWrapper>
    );

    // Find and click the edit button (first one)
    const editButtons = screen.getAllByLabelText(/edit time log/i);
    expect(editButtons.length).toBeGreaterThan(0);

    await userEvent.click(editButtons[0]);

    expect(onTimeLogEdit).toHaveBeenCalledWith(mockTimeLogs[0]);
  });

  test('should call onTimeLogDelete when delete button is clicked', async () => {
    const onTimeLogDelete = jest.fn();

    render(
      <TestWrapper>
        <TaskTimeLogging {...defaultProps} onTimeLogDelete={onTimeLogDelete} />
      </TestWrapper>
    );

    // Find and click the delete button (first one)
    const deleteButtons = screen.getAllByLabelText(/delete time log/i);
    expect(deleteButtons.length).toBeGreaterThan(0);

    await userEvent.click(deleteButtons[0]);

    expect(onTimeLogDelete).toHaveBeenCalledWith(mockTimeLogs[0].id);
  });

  test('should open time log dialog when dialog prop is true', async () => {
    render(
      <TestWrapper>
        <TaskTimeLogging {...defaultProps} timeLogDialogOpen={true} />
      </TestWrapper>
    );

    // Verify dialog is shown (look for dialog title)
    await waitFor(() => {
      expect(screen.getByText('Log Time')).toBeInTheDocument();
    });
  });
});
