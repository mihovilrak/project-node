import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskTimeLogging from '../TaskTimeLogging';
import { TimeLog } from '../../../types/timeLog';
import { BrowserRouter } from 'react-router-dom';

// Global test callback holders
let testOnEdit: ((id: string) => void) | undefined;
let testOnDelete: ((id: string) => void) | undefined;
let testOnSubmit: ((data: any) => void) | undefined;

// Mock child components
jest.mock('../../TimeLog/TimeLogDialog', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="time-log-dialog"
      onClick={() => {
        if (props.onClose) props.onClose();
        if (testOnSubmit) testOnSubmit('submit-data');
        if (props.onSubmit) props.onSubmit('submit-data');
      }}
      open={props.open ? '' : undefined}
      data-timelog={props.timeLog ? JSON.stringify(props.timeLog) : undefined}
      {...props}
    >
      TimeLogDialog
    </div>
  )
}));

jest.mock('../../TimeLog/TimeLogList', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="time-log-list"
      onClick={() => {
        if (testOnEdit) testOnEdit('edit-id');
        if (props.onEdit) props.onEdit('edit-id');
      }}
      onDoubleClick={() => {
        if (testOnDelete) testOnDelete('delete-id');
        if (props.onDelete) props.onDelete('delete-id');
      }}
      {...props}
    >TimeLogList</div>
  )
}));

jest.mock('../../TimeLog/TimeLogStats', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="time-log-stats" {...props}>TimeLogStats</div>
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

const renderComponent = (props = {}) => {
  return render(
    <BrowserRouter>
      <TaskTimeLogging {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('TaskTimeLogging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all child components', () => {
    renderComponent();
    expect(screen.getByTestId('time-log-stats')).toBeInTheDocument();
    expect(screen.getByTestId('time-log-list')).toBeInTheDocument();
    expect(screen.getByTestId('time-log-dialog')).toBeInTheDocument();
  });

  it('renders correctly with empty timeLogs', () => {
    renderComponent({ timeLogs: [] });
    expect(screen.getByTestId('time-log-stats')).toBeInTheDocument();
    expect(screen.getByTestId('time-log-list')).toBeInTheDocument();
    expect(screen.getByTestId('time-log-dialog')).toBeInTheDocument();
  });

  it('calls onTimeLogEdit when edit is triggered in TimeLogList', () => {
    const onTimeLogEdit = jest.fn();
    testOnEdit = onTimeLogEdit;
    renderComponent({ onTimeLogEdit });
    fireEvent.click(screen.getByTestId('time-log-list'));
    expect(onTimeLogEdit).toHaveBeenCalledWith('edit-id');
    testOnEdit = undefined;
  });

  it('calls onTimeLogDelete when delete is triggered in TimeLogList', () => {
    const onTimeLogDelete = jest.fn();
    testOnDelete = onTimeLogDelete;
    renderComponent({ onTimeLogDelete });
    fireEvent.doubleClick(screen.getByTestId('time-log-list'));
    expect(onTimeLogDelete).toHaveBeenCalledWith('delete-id');
    testOnDelete = undefined;
  });

  it('calls onTimeLogSubmit when submit is triggered in TimeLogDialog', () => {
    const onTimeLogSubmit = jest.fn();
    testOnSubmit = onTimeLogSubmit;
    renderComponent({ timeLogDialogOpen: true, onTimeLogSubmit });
    fireEvent.click(screen.getByTestId('time-log-dialog'));
    expect(onTimeLogSubmit).toHaveBeenCalledWith('submit-data');
    testOnSubmit = undefined;
  });

  it('dialog renders with correct props when open', () => {
    const selectedTimeLog = mockTimeLogs[0];
    renderComponent({ timeLogDialogOpen: true, selectedTimeLog });
    const dialog = screen.getByTestId('time-log-dialog');
    expect(dialog).toBeInTheDocument();
    // Since the mock spreads props as attributes, check for the correct attribute values
    // For boolean props, React renders empty string if true, undefined if false
    expect(dialog.getAttribute('open')).not.toBeNull();
    // For object props, we stringified to data-timelog attribute in the mock
    expect(dialog.getAttribute('data-timelog')).toBe(JSON.stringify(selectedTimeLog));
  });

  it('handles dialog close correctly', () => {
    const onTimeLogDialogClose = jest.fn();
    renderComponent({ timeLogDialogOpen: true, onTimeLogDialogClose });
    const dialogComponent = screen.getByTestId('time-log-dialog');
    // Simulate dialog close
    fireEvent.click(dialogComponent);
    expect(onTimeLogDialogClose).toHaveBeenCalled();
  });
});