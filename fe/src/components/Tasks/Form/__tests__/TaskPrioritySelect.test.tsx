import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskPrioritySelect } from '../TaskPrioritySelect';
import { TaskFormState, TaskPriority } from '../../../../types/task';

const mockHandleChange = jest.fn();

const mockPriorities: TaskPriority[] = [
  { id: 1,
    name: 'Low/Wont',
    color: '#000000',
    description: null,
    active: true,
    created_on: '',
    updated_on: null
  },
  { id: 2,
    name: 'Normal/Could',
    color: '#000000',
    description: null,
    active: true,
    created_on: '',
    updated_on: null
},
  { id: 3,
    name: 'High/Should',
    color: '#000000',
    description: null,
    active: true,
    created_on: '',
    updated_on: null
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

describe('TaskPrioritySelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders priority select field with label', () => {
    render(
      <TaskPrioritySelect
        formData={mockFormData}
        priorities={mockPriorities}
        handleChange={mockHandleChange}
      />
    );

    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
  });

  it('renders all priority options', () => {
    render(
      <TaskPrioritySelect
        formData={mockFormData}
        priorities={mockPriorities}
        handleChange={mockHandleChange}
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));

    mockPriorities.forEach(priority => {
      expect(screen.getByText(priority.name)).toBeInTheDocument();
    });
  });

  it('displays selected priority when provided in formData', () => {
    const formDataWithPriority = { ...mockFormData, priority_id: 2 };
    render(
      <TaskPrioritySelect
        formData={formDataWithPriority}
        priorities={mockPriorities}
        handleChange={mockHandleChange}
      />
    );

    // MUI Select displays the selected option text, not a value attribute
    expect(screen.getByText('Normal/Could')).toBeInTheDocument();
  });

  it('calls handleChange when priority is selected', () => {
    render(
      <TaskPrioritySelect
        formData={mockFormData}
        priorities={mockPriorities}
        handleChange={mockHandleChange}
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Normal/Could'));

    expect(mockHandleChange).toHaveBeenCalled();
  });

  it('has required attribute', () => {
    render(
      <TaskPrioritySelect
        formData={mockFormData}
        priorities={mockPriorities}
        handleChange={mockHandleChange}
      />
    );

    expect(screen.getByLabelText(/priority/i)).toBeRequired();
  });

  it('has full width style', () => {
    render(
      <TaskPrioritySelect
        formData={mockFormData}
        priorities={mockPriorities}
        handleChange={mockHandleChange}
      />
    );

    const textField = screen.getByLabelText(/priority/i).closest('.MuiTextField-root');
    expect(textField).toHaveStyle({ width: '100%' });
  });
});