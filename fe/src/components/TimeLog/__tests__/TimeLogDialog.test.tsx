import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TimeLogDialog from '../TimeLogDialog';
import { useAuth } from '../../../context/AuthContext';
import { useTimeLogDialog } from '../../../hooks/timeLog/useTimeLogDialog';
import { TimeLogCreate } from '../../../types/timeLog';
import dayjs from 'dayjs';

// Mock the hooks
jest.mock('../../../context/AuthContext');
jest.mock('../../../hooks/timeLog/useTimeLogDialog');

// Mock data
const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
};

const mockTimeLogData = {
  selectedProjectId: 1,
  selectedTaskId: 1,
  selectedUserId: 1,
  selectedActivityTypeId: 1,
  spentTime: '2',
  description: 'Test description',
  logDate: dayjs(),
  timeError: null,
  projects: [{ id: 1, name: 'Project 1' }],
  tasks: [{ id: 1, name: 'Task 1', project_id: 1 }],
  users: [{ id: 1, name: 'User 1' }],
  activityTypes: [{ id: 1, name: 'Development' }],
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
};

const defaultProps = {
  open: true,
  projectId: undefined,
  taskId: undefined,
  timeLog: null,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
};

// Wrapper component for providing context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    {children}
  </LocalizationProvider>
);

describe('TimeLogDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: mockUser,
      hasPermission: jest.fn().mockReturnValue(false),
    });
    (useTimeLogDialog as jest.Mock).mockReturnValue(mockTimeLogData);
  });

  it('renders dialog with correct title for new time log', () => {
    render(<TimeLogDialog {...defaultProps} />, { wrapper });
    expect(screen.getByText('Log Time')).toBeInTheDocument();
  });

  it('renders dialog with correct title for editing time log', () => {
    render(<TimeLogDialog {...defaultProps} timeLog={{ id: 1 } as any} />, { wrapper });
    expect(screen.getByText('Edit Time Log')).toBeInTheDocument();
  });

  it('shows loading spinner when isLoading is true', () => {
    (useTimeLogDialog as jest.Mock).mockReturnValue({
      ...mockTimeLogData,
      isLoading: true,
    });
    render(<TimeLogDialog {...defaultProps} />, { wrapper });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders form when not loading', () => {
    render(<TimeLogDialog {...defaultProps} />, { wrapper });
    expect(screen.getByLabelText(/Project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Task/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time Spent/i)).toBeInTheDocument();
  });

  it('shows user select when user has admin permission', () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: mockUser,
      hasPermission: jest.fn().mockReturnValue(true),
    });
    render(<TimeLogDialog {...defaultProps} />, { wrapper });
    expect(screen.getByLabelText(/User/i)).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<TimeLogDialog {...defaultProps} />, { wrapper });
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls handleSubmit when Submit button is clicked', () => {
    render(<TimeLogDialog {...defaultProps} />, { wrapper });
    fireEvent.click(screen.getByText('Submit'));
    expect(mockTimeLogData.handleSubmit).toHaveBeenCalled();
  });

  it('disables submit button when loading', () => {
    (useTimeLogDialog as jest.Mock).mockReturnValue({
      ...mockTimeLogData,
      isLoading: true,
    });
    render(<TimeLogDialog {...defaultProps} />, { wrapper });
    expect(screen.getByText('Submit')).toBeDisabled();
  });

  it('closes dialog after successful submission', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<TimeLogDialog {...defaultProps} onSubmit={onSubmit} />, { wrapper });
    
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});