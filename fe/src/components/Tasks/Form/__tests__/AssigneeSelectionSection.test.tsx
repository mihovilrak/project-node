import React from 'react';
import { render, screen } from '@testing-library/react';
import { AssigneeSelectionSection } from '../AssigneeSelectionSection';
import { ProjectMember } from '../../../../types/project';
import { TaskFormState } from '../../../../types/task';

// Mock the AssigneeSelect component
jest.mock('../../AssigneeSelect', () => ({
  AssigneeSelect: ({ label, name, projectMembers }: any) => (
    <div data-testid={`mock-assignee-select-${name}`}>
      Label: {label}
      Name: {name}
      Members: {projectMembers.length}
    </div>
  )
}));

describe('AssigneeSelectionSection', () => {
  const mockProjectMembers: ProjectMember[] = [
    {
      project_id: 1,
      user_id: 1,
      created_on: '2024-01-01',
      name: 'John',
      surname: 'Doe',
      role: 'Developer'
    },
    {
      project_id: 1,
      user_id: 2,
      created_on: '2024-01-01',
      name: 'Jane',
      surname: 'Smith',
      role: 'Project Manager'
    }
  ];

  const mockFormData: TaskFormState = {
    name: '',
    description: '',
    project_id: null,
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

  const defaultProps = {
    formData: mockFormData,
    projectMembers: mockProjectMembers,
    handleChange: mockHandleChange
  };

  it('renders both holder and assignee selects', () => {
    render(<AssigneeSelectionSection {...defaultProps} />);
    
    expect(screen.getByTestId('mock-assignee-select-holder_id')).toBeInTheDocument();
    expect(screen.getByTestId('mock-assignee-select-assignee_id')).toBeInTheDocument();
  });

  it('passes correct props to holder select', () => {
    render(<AssigneeSelectionSection {...defaultProps} />);
    
    const holderSelect = screen.getByTestId('mock-assignee-select-holder_id');
    expect(holderSelect).toHaveTextContent('Label: Holder');
    expect(holderSelect).toHaveTextContent('Name: holder_id');
    expect(holderSelect).toHaveTextContent('Members: 2');
  });

  it('passes correct props to assignee select', () => {
    render(<AssigneeSelectionSection {...defaultProps} />);
    
    const assigneeSelect = screen.getByTestId('mock-assignee-select-assignee_id');
    expect(assigneeSelect).toHaveTextContent('Label: Assignee');
    expect(assigneeSelect).toHaveTextContent('Name: assignee_id');
    expect(assigneeSelect).toHaveTextContent('Members: 2');
  });

  it('renders with empty project members', () => {
    render(
      <AssigneeSelectionSection 
        {...defaultProps}
        projectMembers={[]}
      />
    );
    
    expect(screen.getByTestId('mock-assignee-select-holder_id')).toHaveTextContent('Members: 0');
    expect(screen.getByTestId('mock-assignee-select-assignee_id')).toHaveTextContent('Members: 0');
  });
});