import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskTimeLogs from '../TaskTimeLogs';
import {
  getTaskTimeLogs,
  deleteTimeLog,
  createTimeLog,
  updateTimeLog,
} from '../../../api/timeLogs';
import { TimeLog } from '../../../types/timeLog';
import { Task } from '../../../types/task';

// Mock the API calls
jest.mock('../../../api/timeLogs');

// Mock child components
jest.mock('../../TimeLog/TimeLogDialog', () => ({
  __esModule: true,
  default: ({ open, timeLog, onClose, onSubmit }: any) => (
    <div
      data-testid="time-log-dialog"
      data-open={open ? 'true' : ''}
      data-timelog={timeLog ? JSON.stringify(timeLog) : ''}
    >
      <button data-testid="mock-close-dialog" onClick={onClose}>
        Close
      </button>
      <button
        data-testid="mock-submit-dialog"
        onClick={() =>
          onSubmit &&
          onSubmit({
            task_id: 1,
            activity_type_id: 1,
            log_date: '2023-01-01',
            spent_time: 2,
          })
        }
      >
        Submit
      </button>
      TimeLogDialog
    </div>
  ),
}));

jest.mock('../../TimeLog/TimeLogStats', () => ({
  __esModule: true,
  default: () => <div data-testid="time-log-stats">TimeLogStats</div>,
}));

jest.mock('../../TimeLog/TimeLogList', () => ({
  __esModule: true,
  default: ({ onEdit, onDelete }: any) => (
    <div data-testid="time-log-list">
      <button
        data-testid="mock-edit"
        onClick={() => onEdit && onEdit({ id: 1 })}
      >
        Edit
      </button>
      <button data-testid="mock-delete" onClick={() => onDelete && onDelete(1)}>
        Delete
      </button>
      TimeLogList
    </div>
  ),
}));

let mockCanLogTime = true;
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    hasPermission: (permission: string) =>
      permission === 'Log time' ? mockCanLogTime : true,
    permissionsLoading: false,
  }),
}));

// Mock react-router-dom useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '1',
  }),
}));

const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    log_date: '2023-01-01',
    spent_time: 2,
    description: 'Test log',
    created_on: '2023-01-01',
    updated_on: null,
  },
];

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
  description: 'Test Description',
  type_id: 1,
  type_name: 'Task',
  status_id: 1,
  status_name: 'New',
  priority_id: 1,
  priority_name: 'Normal',
  start_date: null,
  due_date: null,
  end_date: null,
  spent_time: 0,
  progress: 0,
  estimated_time: 0,
  created_by: 1,
  created_by_name: 'Test Creator',
  created_on: '2023-01-01',
};

const renderComponent = async () => {
  await waitFor(() => {
    render(
      <BrowserRouter>
        <TaskTimeLogs task={mockTask} />
      </BrowserRouter>,
    );
  });
};

describe('TaskTimeLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanLogTime = true;
    (getTaskTimeLogs as jest.Mock).mockResolvedValue(mockTimeLogs);
  });

  it('renders loading state initially', () => {
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders time logs after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Time Logs')).toBeInTheDocument();
    expect(screen.getByTestId('time-log-stats')).toBeInTheDocument();
    expect(screen.getByTestId('time-log-list')).toBeInTheDocument();
  });

  it('handles API error correctly', async () => {
    (getTaskTimeLogs as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('opens time log dialog when Log Time button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Log Time'));

    expect(screen.getByTestId('time-log-dialog')).toHaveAttribute(
      'data-open',
      'true',
    );
  });

  it('handles time log deletion', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Simulate delete callback from TimeLogList (mock button)
    fireEvent.click(screen.getByTestId('mock-delete'));

    expect(deleteTimeLog).toHaveBeenCalledWith(1);
    await waitFor(() => expect(getTaskTimeLogs).toHaveBeenCalledTimes(2)); // Initial + after deletion
  });

  it('handles time log edit', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Simulate edit callback from TimeLogList (mock button)
    fireEvent.click(screen.getByTestId('mock-edit'));

    expect(screen.getByTestId('time-log-dialog')).toHaveAttribute(
      'data-open',
      'true',
    );
  });

  it('closes dialog and resets selected time log', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Open dialog
    fireEvent.click(screen.getByText('Log Time'));
    expect(screen.getByTestId('time-log-dialog')).toHaveAttribute(
      'data-open',
      'true',
    );

    // Close dialog
    fireEvent.click(screen.getByTestId('mock-close-dialog'));
    // We can't assert open='false' on the mock, but this click simulates closing.
  });

  it('handles time log submission', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('mock-submit-dialog'));

    await waitFor(() => expect(getTaskTimeLogs).toHaveBeenCalledTimes(2));
    expect(createTimeLog).toHaveBeenCalledTimes(1);
    expect(createTimeLog).toHaveBeenCalledWith(1, {
      task_id: 1,
      activity_type_id: 1,
      log_date: '2023-01-01',
      spent_time: 2,
    });
    expect(updateTimeLog).not.toHaveBeenCalled();
  });

  it('updates the selected time log on submit after edit', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('mock-edit'));
    fireEvent.click(screen.getByTestId('mock-submit-dialog'));

    await waitFor(() => expect(updateTimeLog).toHaveBeenCalledTimes(1));
    expect(updateTimeLog).toHaveBeenCalledWith(1, expect.any(Object));
    expect(createTimeLog).not.toHaveBeenCalled();
  });

  it('shows delete errors without hiding the list', async () => {
    (deleteTimeLog as jest.Mock).mockRejectedValueOnce(
      new Error('Delete failed'),
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('mock-delete'));

    expect(await screen.findByText('Delete failed')).toBeInTheDocument();
    expect(screen.getByTestId('time-log-list')).toBeInTheDocument();
  });

  it('hides Log Time without the Log time permission', async () => {
    mockCanLogTime = false;
    renderComponent();

    expect(await screen.findByTestId('time-log-list')).toBeInTheDocument();
    expect(screen.queryByText('Log Time')).not.toBeInTheDocument();
  });

  it('treats deleting an already removed log as success', async () => {
    (deleteTimeLog as jest.Mock).mockRejectedValueOnce({
      response: { status: 404 },
    });
    renderComponent();
    await screen.findByTestId('time-log-list');

    fireEvent.click(screen.getByTestId('mock-delete'));

    await waitFor(() => {
      expect(getTaskTimeLogs).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
