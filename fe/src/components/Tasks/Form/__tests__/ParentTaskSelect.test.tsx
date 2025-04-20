import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParentTaskSelect } from '../ParentTaskSelect';
import { Task, TaskFormState } from '../../../../types/task';

describe('ParentTaskSelect', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      name: 'Task 1',
      project_id: 1,
      project_name: 'Project 1',
      holder_id: 1,
      holder_name: 'Holder 1',
      assignee_id: 1,
      assignee_name: 'Assignee 1',
      parent_id: null,
      parent_name: null,
      description: '',
      type_id: 1,
      type_name: 'Type 1',
      status_id: 1,
      status_name: 'New',
      priority_id: 1,
      priority_name: 'Low/Wont',
      start_date: null,
      due_date: null,
      end_date: null,
      spent_time: 0,
      progress: 0,
      created_by: 1,
      created_by_name: 'Creator 1',
      created_on: '2024-01-01',
      estimated_time: null
    },
    {
      id: 2,
      name: 'Task 2',
      project_id: 1,
      project_name: 'Project 1',
      holder_id: 1,
      holder_name: 'Holder 1',
      assignee_id: 1,
      assignee_name: 'Assignee 1',
      parent_id: null,
      parent_name: null,
      description: '',
      type_id: 1,
      type_name: 'Type 1',
      status_id: 1,
      status_name: 'New',
      priority_id: 1,
      priority_name: 'Wont/Low',
      start_date: null,
      due_date: null,
      end_date: null,
      spent_time: 0,
      progress: 0,
      created_by: 1,
      created_by_name: 'Creator 1',
      created_on: '2024-01-01',
      estimated_time: null
    }
  ];

  const mockFormData: TaskFormState = {
    name: '',
    description: '',
    project_id: 1,
    type_id: null,
    priority_id: null,
    status_id: null,
    parent_id: null,
    holder_id: null,
    assignee_id: null,
    start_date: null,
    due_date: null,
    estimated_time: null
  };

  const mockHandleChange = jest.fn();

  it('renders when project_id exists', () => {
    render(
      <ParentTaskSelect
        formData={mockFormData}
        projectTasks={mockTasks}
        handleChange={mockHandleChange}
        parentIdFromUrl={null}
      />
    );

    expect(screen.getByLabelText('Parent Task')).toBeInTheDocument();
  });

  it('does not render when project_id is null', () => {
    const formDataWithoutProject = { ...mockFormData, project_id: null };
    render(
      <ParentTaskSelect
        formData={formDataWithoutProject}
        projectTasks={mockTasks}
        handleChange={mockHandleChange}
        parentIdFromUrl={null}
      />
    );

    expect(screen.queryByLabelText('Parent Task')).not.toBeInTheDocument();
  });

  it('shows correct number of task options', () => {
    render(
      <ParentTaskSelect
        formData={mockFormData}
        projectTasks={mockTasks}
        handleChange={mockHandleChange}
        parentIdFromUrl={null}
      />
    );

    const select = screen.getByLabelText('Parent Task');
    fireEvent.mouseDown(select);
    
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('is disabled when parentIdFromUrl is provided', () => {
    render(
      <ParentTaskSelect
        formData={mockFormData}
        projectTasks={mockTasks}
        handleChange={mockHandleChange}
        parentIdFromUrl="1"
      />
    );

    expect(screen.getByLabelText('Parent Task')).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls handleChange when selection changes', () => {
    render(
      <ParentTaskSelect
        formData={mockFormData}
        projectTasks={mockTasks}
        handleChange={mockHandleChange}
        parentIdFromUrl={null}
      />
    );

    const select = screen.getByLabelText('Parent Task');
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('Task 1'));

    expect(mockHandleChange).toHaveBeenCalled();
  });
});