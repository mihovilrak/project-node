import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import SubtaskList from '../SubtaskList';
import { deleteTask } from '../../../api/tasks';
import { Task } from '../../../types/task';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../../api/tasks', () => ({
  deleteTask: jest.fn(),
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

  it('renders list of subtasks', () => {
    render(<SubtaskList {...defaultProps} />);
    
    expect(screen.getByText('Test Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Test Subtask 2')).toBeInTheDocument();
  });

  it('displays empty state when no subtasks', () => {
    render(<SubtaskList {...defaultProps} subtasks={[]} />);
    
    expect(screen.getByText('No subtasks found')).toBeInTheDocument();
  });

  it('handles delete action', async () => {
    (deleteTask as jest.Mock).mockResolvedValueOnce(undefined);
    
    render(<SubtaskList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith(1);
      expect(defaultProps.onSubtaskDeleted).toHaveBeenCalledWith(1);
    });
  });

  it('handles edit navigation', () => {
    render(<SubtaskList {...defaultProps} />);
    
    const editButtons = screen.getAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/tasks/1/edit');
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
    
    // Get all ListItem elements
    const listItems = container.querySelectorAll('.MuiListItem-root');
    expect(listItems.length).toBe(2);
    
    const componentText = container.textContent;
    expect(componentText).toContain('Due:');
    
    expect(componentText).toContain('2024');
  });

  it('handles delete error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (deleteTask as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));
    
    render(<SubtaskList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete subtask:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});