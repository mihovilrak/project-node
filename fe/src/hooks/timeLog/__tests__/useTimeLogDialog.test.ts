import { renderHook, act } from '@testing-library/react';
import { useTimeLogDialog } from '../useTimeLogDialog';
import dayjs from 'dayjs';
import { TimeLog } from '../../../types/timeLog';
import { Task } from '../../../types/task';
import { User } from '../../../types/user';

// Mock dependencies
// --- mockTask and mockUser must be declared before these mocks ---
// (move these lines below their respective declarations)

jest.mock('../useTimeLogData', () => ({
  useTimeLogData: () => ({
    projects: mockProjects,
    tasks: mockTasks,
    users: mockUsers,
    activityTypes: mockActivityTypes,
    isLoading: false,
    handleProjectSelect: jest.fn(),
  }),
}));


jest.mock('../useTimeLogValidation', () => ({
  useTimeLogValidation: () => ({
    timeError: '',
    validateTime: jest.fn().mockReturnValue(true),
    validateAndFormatTime: jest.fn().mockImplementation((time) => parseFloat(time)),
  }),
}));

const mockTimeLog: TimeLog = {
  id: 1,
  task_id: 1,
  user_id: 1,
  activity_type_id: 1,
  log_date: '2025-01-25',
  spent_time: 4,
  description: 'Test log',
  created_on: '2025-01-25T10:00:00Z',
  updated_on: null
};

const mockUser: User = {
  id: 1,
  login: 'testuser',
  name: 'Test',
  surname: 'User',
  email: 'test@example.com',
  role_id: 1,
  status_id: 1,
  avatar_url: null,
  created_on: '2025-01-25T10:00:00Z',
  updated_on: null,
  last_login: null
};

const mockTask: Task = {
  id: 1,
  name: 'Test Task',
  project_id: 1,
  project_name: 'Test Project',
  holder_id: 1,
  holder_name: 'Test Holder',
  assignee_id: 1,
  assignee_name: 'Test Assignee',
  parent_id: null,
  parent_name: null,
  description: 'Test description',
  type_id: 1,
  type_name: 'Test Type',
  status_id: 1,
  status_name: 'Test Status',
  priority_id: 1,
  priority_name: 'Test Priority',
  start_date: null,
  due_date: null,
  end_date: null,
  spent_time: 0,
  progress: 0,
  created_by: 1,
  created_by_name: 'Test Creator',
  created_on: '2025-01-25T10:00:00Z',
  estimated_time: null
};

const defaultProps = {
  timeLog: undefined,
  currentUser: mockUser,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  open: true,
  projectId: undefined,
  taskId: undefined,
  hasAdminPermission: false,
};

// Stable mock arrays to prevent infinite loop due to new reference on each render
const mockProjects = [{ id: 1, name: 'Project 1' }];
const mockTasks = [mockTask];
const mockUsers = [mockUser];
const mockActivityTypes = [{ id: 1, name: 'Activity 1' }];

describe('useTimeLogDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values when no timeLog is provided', () => {
    const { result } = renderHook(() => useTimeLogDialog(defaultProps));

    expect(result.current.selectedProjectId).toBe(undefined);
    expect(result.current.selectedTaskId).toBe(undefined);
    expect(result.current.selectedUserId).toBe(mockUser.id);
    expect(result.current.selectedActivityTypeId).toBe(0);
    expect(result.current.spentTime).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.logDate).toBeDefined();
  });

  it('should initialize with timeLog values when provided', () => {
    const props = {
      ...defaultProps,
      timeLog: mockTimeLog,
    };

    const { result } = renderHook(() => useTimeLogDialog(props));

    expect(result.current.selectedTaskId).toBe(mockTimeLog.task_id);
    expect(result.current.selectedUserId).toBe(mockTimeLog.user_id);
    expect(result.current.selectedActivityTypeId).toBe(mockTimeLog.activity_type_id);
    expect(result.current.spentTime).toBe(String(mockTimeLog.spent_time));
    expect(result.current.description).toBe(mockTimeLog.description || '');
    expect(result.current.logDate.format('YYYY-MM-DD')).toBe(mockTimeLog.log_date);
  });

  it('should handle project change', () => {
    const { result } = renderHook(() => useTimeLogDialog(defaultProps));

    act(() => {
      result.current.handleProjectChange(1);
    });

    expect(result.current.selectedProjectId).toBe(1);
    expect(result.current.selectedTaskId).toBe(undefined);
  });

  it('should handle task change', () => {
    const { result } = renderHook(() => useTimeLogDialog(defaultProps));

    act(() => {
      result.current.handleTaskChange(1, [mockTask]);
    });

    expect(result.current.selectedTaskId).toBe(1);
  });

  it('should handle date change', () => {
    const { result } = renderHook(() => useTimeLogDialog(defaultProps));
    const newDate = dayjs('2025-02-01');

    act(() => {
      result.current.handleDateChange(newDate);
    });

    expect(result.current.logDate).toBe(newDate);
  });

  it('should handle form submission with valid data', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    const props = {
      ...defaultProps,
      onSubmit,
      onClose,
    };

    const { result } = renderHook(() => useTimeLogDialog(props));

    // Set up form data
    act(() => {
      result.current.handleTaskChange(1, [mockTask]);
      result.current.setSpentTime('2.5');
      result.current.setDescription('Test description');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      task_id: 1,
      user_id: mockUser.id,
      activity_type_id: 0,
      log_date: expect.any(String),
      spent_time: 2.5,
      description: 'Test description'
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('should not submit if task is not selected', async () => {
    const onSubmit = jest.fn();
    const props = {
      ...defaultProps,
      onSubmit,
    };

    const { result } = renderHook(() => useTimeLogDialog(props));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should handle submission error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onSubmit = jest.fn().mockRejectedValue(new Error('Submit failed'));
    const props = {
      ...defaultProps,
      onSubmit,
    };

    const { result } = renderHook(() => useTimeLogDialog(props));

    // Set up form data
    act(() => {
      result.current.handleTaskChange(1, [mockTask]);
      result.current.setSpentTime('2.5');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(consoleError).toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
