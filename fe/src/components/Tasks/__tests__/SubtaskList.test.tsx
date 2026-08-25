import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import SubtaskList from '../SubtaskList';
import { deleteTask, getSubtasks } from '../../../api/tasks';
import { Task } from '../../../types/task';
import logger from '../../../utils/logger';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../../api/tasks', () => ({
  deleteTask: jest.fn(),
  getSubtasks: jest.fn()
}));

const mockNavigate = jest.fn();
(useNavigate as jest.Mock).mockImplementation(() => mockNavigate);

const mockSubtasks: Task[] = [
  {
    id: 1,
    name: 'Test Subtask 1',
    description: 'Description 1',
    status_name: 'In Progress',
    priority_name: 'High/Should',
    due_date: '2024-01-01',
    project_id: 1,
    project_name: 'Test Project',
    holder_id: 1,
    holder_name: 'Test Holder',
    assignee_id: 1,
    assignee_name: 'Test Assignee',
    parent_id: null,
    parent_name: null,
    type_id: 1,
    type_name: 'Task',
    status_id: 1,
    priority_id: 1,
    start_date: null,
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test Creator',
    created_on: '2024-01-01',
    estimated_time: null
  },
  {
    id: 2,
    name: 'Test Subtask 2',
    description: 'Description 2',
    status_name: 'Done',
    priority_name: 'Normal/Could',
    due_date: '2024-01-02',
    project_id: 1,
    project_name: 'Test Project',
    holder_id: 1,
    holder_name: 'Test Holder',
    assignee_id: 1,
    assignee_name: 'Test Assignee',
    parent_id: null,
    parent_name: null,
    type_id: 1,
    type_name: 'Task',
    status_id: 2,
    priority_id: 2,
    start_date: null,
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test Creator',
    created_on: '2024-01-01',
    estimated_time: null
  }
];

const defaultProps = {
  subtasks: mockSubtasks,
  onSubtaskDeleted: jest.fn(),
  onSubtaskUpdated: jest.fn(),
  parentTaskId: 1
};

describe('SubtaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list of subtasks with ID and metadata', () => {
    render(<SubtaskList {...defaultProps} />);

    expect(screen.getByText('Test Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Test Subtask 2')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getAllByText('Task').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('displays empty state when no subtasks', () => {
    render(<SubtaskList {...defaultProps} subtasks={[]} />);

    expect(screen.getByText('No subtasks found')).toBeInTheDocument();
  });

  it('handles delete action', async () => {
    (deleteTask as jest.Mock).mockResolvedValueOnce(undefined);

    render(<SubtaskList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete subtask');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith(1);
      expect(defaultProps.onSubtaskDeleted).toHaveBeenCalledWith(1);
    });
  });

  it('handles edit navigation', () => {
    render(<SubtaskList {...defaultProps} />);

    const editButtons = screen.getAllByLabelText('Edit subtask');
    fireEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/tasks/1/edit');
  });

  it('navigates to subtask details when name is clicked', () => {
    render(<SubtaskList {...defaultProps} />);

    const subtaskName = screen.getByText('Test Subtask 1');
    // Verify that the subtask name element points to the task details route
    expect(subtaskName).toHaveAttribute('to', '/tasks/1');
  });

  it('applies correct styling for completed tasks', () => {
    render(<SubtaskList {...defaultProps} />);

    const completedTask = screen.getByText('Test Subtask 2');
    expect(completedTask).toHaveStyle({ textDecoration: 'line-through' });
  });

  it('displays priority chips', () => {
    render(<SubtaskList {...defaultProps} />);

    expect(screen.getByText('High/Should')).toBeInTheDocument();
    expect(screen.getByText('Normal/Could')).toBeInTheDocument();
  });

  it('displays due dates correctly', () => {
    const { container } = render(<SubtaskList {...defaultProps} />);

    // Table header should contain the Due column
    expect(screen.getByText('Due')).toBeInTheDocument();

    // Rendered dates should include the year from the mock data
    const componentText = container.textContent || '';
    expect(componentText).toContain('2024');
  });

  it('handles delete error gracefully', async () => {
    (deleteTask as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

    render(<SubtaskList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete subtask');
    fireEvent.click(deleteButtons[0]);

    await waitFor(
      () => {
        expect(logger.error).toHaveBeenCalledWith('Failed to delete subtask', expect.any(Error));
      },
      { timeout: 2000 }
    );
  }, 5000);

  it('fetches and shows nested subtasks when expand is clicked', async () => {
    const nestedTasks: Task[] = [
      {
        ...mockSubtasks[0],
        id: 3,
        name: 'Nested Subtask',
        parent_id: 1
      }
    ];
    (getSubtasks as jest.Mock).mockResolvedValue(nestedTasks);

    render(<SubtaskList {...defaultProps} />);

    const expandButtons = screen.getAllByRole('button', { name: /expand subtasks/i });
    fireEvent.click(expandButtons[0]);

    await waitFor(() => {
      expect(getSubtasks).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Nested Subtask')).toBeInTheDocument();
    });
  });
});