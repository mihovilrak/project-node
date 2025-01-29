import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskTimeLogging from '../TaskTimeLogging';
import { TimeLog } from '../../../types/timeLog';
import { BrowserRouter } from 'react-router-dom';

// Mock child components
jest.mock('../../TimeLog/TimeLogDialog', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="time-log-dialog" {...props}>TimeLogDialog</div>
}));

jest.mock('../../TimeLog/TimeLogList', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="time-log-list" {...props}>TimeLogList</div>
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

  it('passes correct props to TimeLogStats', () => {
    renderComponent();
    const statsComponent = screen.getByTestId('time-log-stats');
    expect(statsComponent).toHaveAttribute('timeLogs', JSON.stringify(mockTimeLogs));
  });

  it('passes correct props to TimeLogList', () => {
    renderComponent();
    const listComponent = screen.getByTestId('time-log-list');
    expect(listComponent).toHaveAttribute('timeLogs', JSON.stringify(mockTimeLogs));
    expect(listComponent).toHaveAttribute('onEdit', expect.any(String));
    expect(listComponent).toHaveAttribute('onDelete', expect.any(String));
  });

  it('passes correct props to TimeLogDialog', () => {
    const timeLogDialogOpen = true;
    const selectedTimeLog = mockTimeLogs[0];
    
    renderComponent({ timeLogDialogOpen, selectedTimeLog });
    
    const dialogComponent = screen.getByTestId('time-log-dialog');
    expect(dialogComponent).toHaveAttribute('open', 'true');
    expect(dialogComponent).toHaveAttribute('timeLog', JSON.stringify(selectedTimeLog));
    expect(dialogComponent).toHaveAttribute('taskId', '1');
    expect(dialogComponent).toHaveAttribute('projectId', '1');
  });

  it('handles dialog close correctly', () => {
    renderComponent({ timeLogDialogOpen: true });
    const dialogComponent = screen.getByTestId('time-log-dialog');
    
    // Simulate dialog close
    fireEvent.click(dialogComponent);
    
    expect(defaultProps.onTimeLogDialogClose).toHaveBeenCalled();
  });

  it('renders within Paper component with correct styling', () => {
    renderComponent();
    const paperComponent = screen.getByTestId('time-log-stats').closest('div');
    expect(paperComponent).toHaveStyle({
      padding: '16px',
      marginBottom: '16px'
    });
  });
});