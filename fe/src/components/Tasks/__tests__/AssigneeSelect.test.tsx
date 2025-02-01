import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssigneeSelect } from '../AssigneeSelect';
import { ProjectMember } from '../../../types/project';
import { TaskFormState } from '../../../types/task';

const mockProjectMembers: ProjectMember[] = [
  {
    project_id: 1,
    user_id: 1,
    created_on: '2023-01-01',
    name: 'John',
    surname: 'Doe',
    role: 'Developer'
  },
  {
    project_id: 1,
    user_id: 2,
    created_on: '2023-01-01',
    name: 'Jane',
    surname: 'Smith',
    role: 'Project Manager'
  }
];

const mockFormData: TaskFormState = {
  name: 'Test Task',
  description: '',
  project_id: 1,
  type_id: 1,
  priority_id: 1,
  status_id: 1,
  parent_id: null,
  holder_id: 1,
  assignee_id: null,
  start_date: null,
  due_date: null,
  estimated_time: null
};

const mockHandleChange = jest.fn();

describe('AssigneeSelect', () => {
  const renderAssigneeSelect = () => {
    return render(
      <AssigneeSelect
        label="Assignee"
        name="assignee_id"
        projectMembers={mockProjectMembers}
        formData={mockFormData}
        handleChange={mockHandleChange}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct label', () => {
    renderAssigneeSelect();
    expect(screen.getByLabelText('Assignee')).toBeInTheDocument();
  });

  test('shows unassigned option', () => {
    renderAssigneeSelect();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  test('displays all project members', () => {
    renderAssigneeSelect();
    mockProjectMembers.forEach(member => {
      expect(screen.getByText(`${member.name} ${member.surname}`)).toBeInTheDocument();
    });
  });

  test('calls handleChange when selection changes', () => {
    renderAssigneeSelect();
    const select = screen.getByLabelText('Assignee');
    fireEvent.change(select, { target: { value: '2' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('uses correct initial value from formData', () => {
    const formDataWithAssignee = {
      ...mockFormData,
      assignee_id: 1
    };
    
    render(
      <AssigneeSelect
        label="Assignee"
        name="assignee_id"
        projectMembers={mockProjectMembers}
        formData={formDataWithAssignee}
        handleChange={mockHandleChange}
      />
    );

    const select = screen.getByLabelText('Assignee');
    expect(select).toHaveValue('1');
  });

  test('applies full width style', () => {
    renderAssigneeSelect();
    const textField = screen.getByLabelText('Assignee');
    expect(textField.parentElement).toHaveStyle({ width: '100%' });
  });

  test('handles empty project members array', () => {
    render(
      <AssigneeSelect
        label="Assignee"
        name="assignee_id"
        projectMembers={[]}
        formData={mockFormData}
        handleChange={mockHandleChange}
      />
    );
    
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeNull();
  });
});