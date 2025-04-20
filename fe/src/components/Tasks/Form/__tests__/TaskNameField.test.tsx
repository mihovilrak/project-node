import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskNameField } from '../TaskNameField';
import { TaskFormState } from '../../../../types/task';

const mockHandleChange = jest.fn();

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

describe('TaskNameField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the task name input field', () => {
    render(<TaskNameField formData={mockFormData} handleChange={mockHandleChange} />);
    
    const inputElement = screen.getByRole('textbox', { name: /name/i });
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toBeRequired();
  });

  it('displays the current value from formData', () => {
    const formDataWithName = { ...mockFormData, name: 'Test Task' };
    render(<TaskNameField formData={formDataWithName} handleChange={mockHandleChange} />);
    
    const inputElement = screen.getByRole('textbox', { name: /name/i });
    expect(inputElement).toHaveValue('Test Task');
  });

  it('calls handleChange with correct data when input changes', () => {
    render(<TaskNameField formData={mockFormData} handleChange={mockHandleChange} />);
    
    const inputElement = screen.getByRole('textbox', { name: /name/i });
    fireEvent.change(inputElement, { target: { value: 'New Task Name' } });

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: 'name',
        value: 'New Task Name'
      }
    });
  });

  it('has required attribute', () => {
    render(<TaskNameField formData={mockFormData} handleChange={mockHandleChange} />);
    
    const inputElement = screen.getByRole('textbox', { name: /name/i });
    expect(inputElement).toHaveAttribute('required');
  });

  it('has full width style', () => {
    render(<TaskNameField formData={mockFormData} handleChange={mockHandleChange} />);
    const input = screen.getByRole('textbox', { name: /name/i });
    const textFieldRoot = input.closest('.MuiTextField-root');
    expect(textFieldRoot).toBeInTheDocument();
    expect(textFieldRoot).toHaveStyle({ width: '100%' });
  });
});