import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskDescriptionField } from '../TaskDescriptionField';
import userEvent from '@testing-library/user-event';
import { TaskFormState } from '../../../../types/task';

describe('TaskDescriptionField', () => {
  const mockHandleChange = jest.fn();
  
  const defaultFormData: TaskFormState = {
    name: '',
    description: '',  // Initialize as empty string instead of null
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct label', () => {
    render(
      <TaskDescriptionField 
        formData={defaultFormData} 
        handleChange={mockHandleChange} 
      />
    );
    
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('displays initial value correctly', () => {
    const testFormData = {
      ...defaultFormData,
      description: 'Test description'
    };

    render(
      <TaskDescriptionField 
        formData={testFormData} 
        handleChange={mockHandleChange} 
      />
    );
    
    expect(screen.getByLabelText('Description')).toHaveValue('Test description');
  });

  it('handles empty description correctly', () => {
    const emptyFormData = {
      ...defaultFormData,
      description: ''  // Use empty string instead of null
    };

    render(
      <TaskDescriptionField 
        formData={emptyFormData} 
        handleChange={mockHandleChange} 
      />
    );
    
    expect(screen.getByLabelText('Description')).toHaveValue('');
  });

  it('calls handleChange when input changes', () => {
    render(
      <TaskDescriptionField 
        formData={defaultFormData} 
        handleChange={mockHandleChange} 
      />
    );
    
    const input = screen.getByLabelText('Description');
    userEvent.type(input, 'New description');
    
    expect(mockHandleChange).toHaveBeenCalled();
  });
});