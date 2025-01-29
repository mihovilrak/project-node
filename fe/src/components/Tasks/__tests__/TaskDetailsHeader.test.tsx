import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskDetailsHeader from '../TaskDetailsHeader';
import { Task, TaskStatus } from '../../../types/task';

// Mock the TaskHeader component
jest.mock('./TaskHeader', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="task-header">
      <span>Task Name: {props.task?.name}</span>
      <span>Status Count: {props.statuses?.length}</span>
      <button onClick={props.onStatusMenuClick}>Status Menu</button>
      <button onClick={props.onStatusMenuClose}>Close Menu</button>
      <button onClick={() => props.onStatusChange(2)}>Change Status</button>
      <button onClick={props.onDelete}>Delete</button>
      <button onClick={props.onTimeLogClick}>Time Log</button>
      <button onClick={props.onAddSubtaskClick}>Add Subtask</button>
    </div>
  )
}));

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
  type_name: 'Task',
  status_id: 1,
  status_name: 'New',
  priority_id: 1,
  priority_name: 'Normal',
  start_date: '2024-03-20',
  due_date: '2024-03-27',
  end_date: null,
  spent_time: 0,
  progress: 0,
  created_by: 1,
  created_by_name: 'Test Creator',
  created_on: '2024-03-20',
  estimated_time: 8
};

const mockStatuses: TaskStatus[] = [
  {
    id: 1,
    name: 'New',
    color: '#000000',
    description: null,
    active: true,
    created_on: '2024-03-20',
    updated_on: null
  },
  {
    id: 2,
    name: 'In Progress',
    color: '#0000FF',
    description: null,
    active: true,
    created_on: '2024-03-20',
    updated_on: null
  }
];

describe('TaskDetailsHeader', () => {
  const defaultProps = {
    task: mockTask,
    statuses: mockStatuses,
    statusMenuAnchor: null,
    onStatusMenuClick: jest.fn(),
    onStatusMenuClose: jest.fn(),
    onStatusChange: jest.fn(),
    onDelete: jest.fn(),
    onTimeLogClick: jest.fn(),
    onAddSubtaskClick: jest.fn(),
    canEdit: true,
    canDelete: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<TaskDetailsHeader {...defaultProps} />);
    expect(screen.getByTestId('task-header')).toBeInTheDocument();
    expect(screen.getByText(`Task Name: ${mockTask.name}`)).toBeInTheDocument();
    expect(screen.getByText(`Status Count: ${mockStatuses.length}`)).toBeInTheDocument();
  });

  it('passes all props correctly to TaskHeader', () => {
    render(<TaskDetailsHeader {...defaultProps} />);
    
    const taskHeader = screen.getByTestId('task-header');
    expect(taskHeader).toBeInTheDocument();
    
    // Verify that the TaskHeader receives all necessary props
    expect(screen.getByRole('button', { name: 'Status Menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close Menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change Status' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Time Log' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Subtask' })).toBeInTheDocument();
  });

  it('handles empty statuses array gracefully', () => {
    render(<TaskDetailsHeader {...defaultProps} statuses={[]} />);
    expect(screen.getByTestId('task-header')).toBeInTheDocument();
    expect(screen.getByText('Status Count: 0')).toBeInTheDocument();
  });

  it('handles callbacks correctly', () => {
    render(<TaskDetailsHeader {...defaultProps} />);

    // Test each callback
    screen.getByRole('button', { name: 'Status Menu' }).click();
    expect(defaultProps.onStatusMenuClick).toHaveBeenCalledTimes(1);

    screen.getByRole('button', { name: 'Close Menu' }).click();
    expect(defaultProps.onStatusMenuClose).toHaveBeenCalledTimes(1);

    screen.getByRole('button', { name: 'Change Status' }).click();
    expect(defaultProps.onStatusChange).toHaveBeenCalledTimes(1);
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith(2);

    screen.getByRole('button', { name: 'Delete' }).click();
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);

    screen.getByRole('button', { name: 'Time Log' }).click();
    expect(defaultProps.onTimeLogClick).toHaveBeenCalledTimes(1);

    screen.getByRole('button', { name: 'Add Subtask' }).click();
    expect(defaultProps.onAddSubtaskClick).toHaveBeenCalledTimes(1);
  });

  it('renders with minimal props', () => {
    const minimalProps = {
      task: mockTask,
      statuses: [],
      statusMenuAnchor: null,
      onStatusMenuClick: jest.fn(),
      onStatusMenuClose: jest.fn(),
      onStatusChange: jest.fn(),
      onDelete: jest.fn(),
      onTimeLogClick: jest.fn(),
      onAddSubtaskClick: jest.fn(),
      canEdit: false,
      canDelete: false
    };

    render(<TaskDetailsHeader {...minimalProps} />);
    expect(screen.getByTestId('task-header')).toBeInTheDocument();
  });
});