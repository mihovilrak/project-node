import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskHeader from '../TaskHeader';
import { Task, TaskStatus } from '../../../types/task';

// Mock data
const mockTask: Task = {
  id: 1,
  name: 'Test Task',
  project_id: 1,
  project_name: 'Test Project',
  holder_id: 1,
  holder_name: 'John Holder',
  assignee_id: 2,
  assignee_name: 'Jane Assignee',
  parent_id: null,
  parent_name: null,
  description: 'Test description',
  type_id: 1,
  type_name: 'Bug',
  type_color: '#f44336',
  status_id: 1,
  status_name: 'In Progress',
  priority_id: 1,
  priority_name: 'High',
  start_date: '2023-01-01',
  due_date: '2023-12-31',
  end_date: null,
  spent_time: 10,
  progress: 50,
  created_by: 1,
  created_by_name: 'John Creator',
  created_on: '2023-01-01',
  estimated_time: 20
};

const mockStatuses: TaskStatus[] = [
  {
    id: 1,
    name: 'New',
    color: '#2196f3',
    description: null,
    active: true,
    created_on: '2023-01-01',
    updated_on: null
  },
  {
    id: 2,
    name: 'In Progress',
    color: '#4caf50',
    description: null,
    active: true,
    created_on: '2023-01-01',
    updated_on: null
  }
];

const defaultProps = {
  task: mockTask,
  statuses: mockStatuses,
  statusMenuAnchor: null,
  onStatusMenuClick: jest.fn(),
  onStatusMenuClose: jest.fn(),
  onStatusChange: jest.fn(),
  canEdit: true,
  canDelete: true,
  onDelete: jest.fn(),
  onTimeLogClick: jest.fn(),
  onAddSubtaskClick: jest.fn()
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('TaskHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task name and basic information', () => {
    renderWithRouter(<TaskHeader {...defaultProps} />);
    
    expect(screen.getByText(mockTask.name)).toBeInTheDocument();
    expect(screen.getByTestId('project-name')).toHaveTextContent(`Project: ${mockTask.project_name}`);
    expect(screen.getByTestId('holder-name')).toHaveTextContent(`Holder: ${mockTask.holder_name}`);
    expect(screen.getByTestId('assignee-name')).toHaveTextContent(`Assignee: ${mockTask.assignee_name}`);
  });

  it('renders status button with correct color', () => {
    renderWithRouter(<TaskHeader {...defaultProps} />);
    
    const statusButton = screen.getByText('New');
    expect(statusButton).toHaveStyle({ backgroundColor: '#2196f3' });
  });

  it('shows delete button when canDelete is true', () => {
    renderWithRouter(<TaskHeader {...defaultProps} />);
    
    const deleteButton = screen.getByLabelText('delete');
    expect(deleteButton).toBeInTheDocument();
  });

  it('hides delete button when canDelete is false', () => {
    renderWithRouter(<TaskHeader {...defaultProps} canDelete={false} />);
    
    const deleteButton = screen.queryByLabelText('delete');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    renderWithRouter(<TaskHeader {...defaultProps} />);
    
    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalled();
  });

  it('calls onStatusMenuClick when status button is clicked and canEdit is true', () => {
    renderWithRouter(<TaskHeader {...defaultProps} />);
    
    const statusButton = screen.getByText('New');
    fireEvent.click(statusButton);
    expect(defaultProps.onStatusMenuClick).toHaveBeenCalled();
  });

  it('does not call onStatusMenuClick when status button is clicked and canEdit is false', () => {
    renderWithRouter(<TaskHeader {...defaultProps} canEdit={false} />);
    
    const statusButton = screen.getByText('New');
    fireEvent.click(statusButton);
    expect(defaultProps.onStatusMenuClick).not.toHaveBeenCalled();
  });

  it('renders dates in correct format', () => {
    renderWithRouter(<TaskHeader {...defaultProps} />);
    
    expect(screen.getByText(`Created: ${new Date(mockTask.created_on).toLocaleDateString()}`)).toBeInTheDocument();
    expect(screen.getByText(`Due: ${new Date(mockTask.due_date!).toLocaleDateString()}`)).toBeInTheDocument();
  });

  it('renders progress when available', () => {
    renderWithRouter(<TaskHeader {...defaultProps} />);
    
    expect(screen.getByText(`Progress: ${mockTask.progress}%`)).toBeInTheDocument();
  });

  it('renders estimated and spent time when available', () => {
    renderWithRouter(<TaskHeader {...defaultProps} />);
    
    expect(screen.getByText(`Estimated Time: ${mockTask.estimated_time} hours`)).toBeInTheDocument();
    expect(screen.getByText(`Time Spent: ${mockTask.spent_time} hours`)).toBeInTheDocument();
  });

  it('handles null task gracefully', () => {
    renderWithRouter(<TaskHeader {...defaultProps} task={null} />);
    
    expect(screen.queryByText(mockTask.name)).not.toBeInTheDocument();
  });

  it('handles empty statuses array gracefully', () => {
    renderWithRouter(<TaskHeader {...defaultProps} statuses={[]} />);
    
    expect(screen.getByText('Unknown Status')).toBeInTheDocument();
  });
});