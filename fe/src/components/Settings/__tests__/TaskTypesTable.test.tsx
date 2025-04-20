import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskTypesTable from '../TaskTypesTable';
import { TaskType } from '../../../types/setting';

const mockTaskTypes: TaskType[] = [
  {
    id: 1,
    name: 'Task',
    color: '#2196f3',
    icon: 'TaskAlt',
    description: 'A task is a unit of work that needs to be completed.',
    active: true
  },
  {
    id: 2,
    name: 'Bug',
    color: '#f44336',
    icon: 'BugReport',
    description: 'A bug is an error or issue in a program.',
    active: false
  }
];

describe('TaskTypesTable', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <TaskTypesTable
        taskTypes={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={true}
      />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders table with task types data', () => {
    render(
      <TaskTypesTable
        taskTypes={mockTaskTypes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
      />
    );

    // Check table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check task type data
    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('A task is a unit of work that needs to be completed.')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TaskTypesTable
        taskTypes={mockTaskTypes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
      />
    );

    const editButtons = screen.getAllByRole('button');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTaskTypes[0]);
  });

  it('displays correct status chips', () => {
    render(
      <TaskTypesTable
        taskTypes={mockTaskTypes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('updates task types when props change', () => {
    const { rerender } = render(
      <TaskTypesTable
        taskTypes={[mockTaskTypes[0]]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
      />
    );

    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(screen.queryByText('Bug')).not.toBeInTheDocument();

    rerender(
      <TaskTypesTable
        taskTypes={mockTaskTypes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
      />
    );

    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
  });

  it('renders color boxes with correct colors', () => {
    render(
      <TaskTypesTable
        taskTypes={mockTaskTypes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        loading={false}
      />
    );

    // Use data-testid to reliably find color boxes
    const firstColorBox = screen.getByTestId('color-box-1');
    const secondColorBox = screen.getByTestId('color-box-2');
    
    // Verify the elements exist
    expect(firstColorBox).toBeInTheDocument();
    expect(secondColorBox).toBeInTheDocument();
    
    // Verify the color boxes have the correct background colors
    // Check computed style instead of inline style attributes
    expect(window.getComputedStyle(firstColorBox).backgroundColor).toBe('rgb(33, 150, 243)');
    expect(window.getComputedStyle(secondColorBox).backgroundColor).toBe('rgb(244, 67, 54)');
  });
});