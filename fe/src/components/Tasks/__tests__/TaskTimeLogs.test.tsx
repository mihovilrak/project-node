import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskTimeLogs from '../TaskTimeLogs';
import { getTaskTimeLogs, deleteTimeLog } from '../../../api/timeLogs';
import { TimeLog } from '../../../types/timeLog';
import { Task } from '../../../types/task';

// Mock the API calls
jest.mock('../../../api/timeLogs');

// Mock child components
jest.mock('../../TimeLog/TimeLogDialog', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="time-log-dialog" {...props}>TimeLogDialog</div>
}));

jest.mock('../../TimeLog/TimeLogStats', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="time-log-stats" {...props}>TimeLogStats</div>
}));

jest.mock('../../TimeLog/TimeLogList', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="time-log-list" {...props}>TimeLogList</div>
}));

// Mock react-router-dom useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '1'
  })
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
    updated_on: null
  }
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
  created_on: '2023-01-01'
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <TaskTimeLogs task={mockTask} />
    </BrowserRouter>
  );
};

describe('TaskTimeLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(screen.getByText('Failed to load time logs')).toBeInTheDocument();
    });
  });

  it('opens time log dialog when Log Time button is clicked', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Log Time'));
    
    expect(screen.getByTestId('time-log-dialog')).toHaveAttribute('open', 'true');
  });

  it('handles time log deletion', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    const timeLogList = screen.getByTestId('time-log-list');
    
    // Simulate delete callback from TimeLogList
    fireEvent.click(timeLogList);
    
    expect(deleteTimeLog).not.toHaveBeenCalled();
    
    // Simulate actual deletion through props
    const { onDelete } = JSON.parse(timeLogList.getAttribute('props') || '{}');
    await onDelete(1);
    
    expect(deleteTimeLog).toHaveBeenCalledWith(1);
    expect(getTaskTimeLogs).toHaveBeenCalledTimes(2); // Initial + after deletion
  });

  it('handles time log edit', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    const timeLogList = screen.getByTestId('time-log-list');
    
    // Simulate edit callback from TimeLogList
    const { onEdit } = JSON.parse(timeLogList.getAttribute('props') || '{}');
    onEdit(mockTimeLogs[0]);
    
    expect(screen.getByTestId('time-log-dialog')).toHaveAttribute('open', 'true');
    expect(screen.getByTestId('time-log-dialog')).toHaveAttribute('timeLog', JSON.stringify(mockTimeLogs[0]));
  });

  it('closes dialog and resets selected time log', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Open dialog
    fireEvent.click(screen.getByText('Log Time'));
    expect(screen.getByTestId('time-log-dialog')).toHaveAttribute('open', 'true');
    
    // Close dialog
    const dialog = screen.getByTestId('time-log-dialog');
    const { onClose } = JSON.parse(dialog.getAttribute('props') || '{}');
    onClose();
    
    expect(dialog).toHaveAttribute('open', 'false');
  });

  it('handles time log submission', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    const dialog = screen.getByTestId('time-log-dialog');
    const { onSubmit } = JSON.parse(dialog.getAttribute('props') || '{}');
    
    await onSubmit({
      task_id: 1,
      activity_type_id: 1,
      log_date: '2023-01-01',
      spent_time: 2
    });
    
    expect(getTaskTimeLogs).toHaveBeenCalledTimes(2); // Initial + after submission
    expect(dialog).toHaveAttribute('open', 'false');
  });
});