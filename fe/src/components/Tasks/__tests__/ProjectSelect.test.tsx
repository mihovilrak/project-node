import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectSelect } from '../ProjectSelect';
import { Project } from '../../../types/project';
import { TaskFormState } from '../../../types/task';

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Project Alpha',
    description: 'Test project 1',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'Active',
    start_date: '2023-01-01',
    due_date: '2023-12-31',
    end_date: null,
    created_by: 1,
    created_by_name: 'John Doe',
    created_on: '2023-01-01',
    updated_on: null,
    estimated_time: 100,
    spent_time: 50,
    progress: 50
  },
  {
    id: 2,
    name: 'Project Beta',
    description: 'Test project 2',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'Active',
    start_date: '2023-01-01',
    due_date: '2023-12-31',
    end_date: null,
    created_by: 1,
    created_by_name: 'John Doe',
    created_on: '2023-01-01',
    updated_on: null,
    estimated_time: 100,
    spent_time: 50,
    progress: 50
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

describe('ProjectSelect', () => {
  const renderProjectSelect = (projectIdFromQuery?: string | null) => {
    return render(
      <ProjectSelect
        projects={mockProjects}
        formData={mockFormData}
        handleChange={mockHandleChange}
        projectIdFromQuery={projectIdFromQuery}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct label', () => {
    renderProjectSelect();
    expect(screen.getByLabelText('Project')).toBeInTheDocument();
  });

  test('displays all projects', () => {
    renderProjectSelect();
    mockProjects.forEach(project => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    });
  });

  test('calls handleChange when selection changes', () => {
    renderProjectSelect();
    const select = screen.getByLabelText('Project');
    fireEvent.change(select, { target: { value: 2 } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('uses correct initial value from formData', () => {
    renderProjectSelect();
    const select = screen.getByLabelText('Project');
    expect(select).toHaveValue('1');
  });

  test('is disabled when projectIdFromQuery is provided', () => {
    renderProjectSelect('1');
    const select = screen.getByLabelText('Project');
    expect(select).toBeDisabled();
  });

  test('is enabled when projectIdFromQuery is null', () => {
    renderProjectSelect(null);
    const select = screen.getByLabelText('Project');
    expect(select).not.toBeDisabled();
  });

  test('applies full width style', () => {
    renderProjectSelect();
    const textField = screen.getByLabelText('Project');
    expect(textField.parentElement).toHaveStyle({ width: '100%' });
  });

  test('is marked as required', () => {
    renderProjectSelect();
    const select = screen.getByLabelText('Project');
    expect(select).toBeRequired();
  });

  test('handles empty projects array', () => {
    render(
      <ProjectSelect
        projects={[]}
        formData={mockFormData}
        handleChange={mockHandleChange}
      />
    );
    const select = screen.getByLabelText('Project');
    expect(select).toBeInTheDocument();
    expect(screen.queryByRole('option')).toBeNull();
  });
});