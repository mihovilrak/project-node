import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileTaskList from '../ProfileTaskList';
import { Task } from '../../../types/task';
import { BrowserRouter } from 'react-router-dom';

const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Test Task 1',
    project_name: 'Project 1',
    project_id: 1,
    status_name: 'New',
    priority_name: 'High/Should',
    priority_color: '#ff0000',
    holder_id: 1,
    holder_name: 'John',
    assignee_id: 2,
    assignee_name: 'Jane',
    parent_id: null,
    parent_name: null,
    description: '',
    type_id: 2,
    type_name: 'Bug',
    status_id: 1,
    priority_id: 3,
    start_date: null,
    due_date: null,
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'John',
    created_on: '2023-01-01',
    estimated_time: null
  }
];

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProfileTaskList', () => {
  const mockOnTaskClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when loading prop is true', () => {
    renderWithRouter(
      <ProfileTaskList tasks={[]} loading={true} onTaskClick={mockOnTaskClick} />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Recent Tasks')).not.toBeInTheDocument();
  });

  it('renders empty list when no tasks are provided', () => {
    renderWithRouter(
      <ProfileTaskList tasks={[]} loading={false} onTaskClick={mockOnTaskClick} />
    );
    expect(screen.getByText('Recent Tasks')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('renders tasks with correct information', () => {
    renderWithRouter(
      <ProfileTaskList tasks={mockTasks} loading={false} onTaskClick={mockOnTaskClick} />
    );
    
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('High/Should')).toBeInTheDocument();
  });

  it('renders correct number of tasks', () => {
    renderWithRouter(
      <ProfileTaskList tasks={mockTasks} loading={false} onTaskClick={mockOnTaskClick} />
    );
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(mockTasks.length);
  });

  it('calls onTaskClick with correct task id when clicked', () => {
    renderWithRouter(
      <ProfileTaskList tasks={mockTasks} loading={false} onTaskClick={mockOnTaskClick} />
    );
    
    const taskItem = screen.getByText('Test Task 1');
    fireEvent.click(taskItem);
    expect(mockOnTaskClick).toHaveBeenCalledWith(1);
  });

  it('renders chips with correct variants and colors', () => {
    renderWithRouter(
      <ProfileTaskList tasks={mockTasks} loading={false} onTaskClick={mockOnTaskClick} />
    );
    
    const chips = screen.getAllByRole('button');
    expect(chips).toHaveLength(3); // Project, Status, and Priority chips
    
    // Check project chip
    const projectChip = screen.getByText('Project 1');
    expect(projectChip.closest('.MuiChip-outlined')).toBeInTheDocument();
    
    // Check status chip
    const statusChip = screen.getByText('New');
    expect(statusChip.closest('.MuiChip-outlined')).toBeInTheDocument();
    expect(statusChip.closest('.MuiChip-colorPrimary')).toBeInTheDocument();
    
    // Check priority chip
    const priorityChip = screen.getByText('High/Should');
    expect(priorityChip).toHaveStyle({ backgroundColor: '#ff0000', color: 'white' });
  });
});