import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskStatusSelect } from '../TaskStatusSelect';
import { TaskStatus, TaskFormState } from '../../../../types/task';

describe('TaskStatusSelect', () => {
  const mockStatuses: TaskStatus[] = [
    {
      id: 1,
      name: 'New',
      color: '#000000',
      description: null,
      active: true,
      created_on: '2023-01-01',
      updated_on: null
    },
    {
      id: 2,
      name: 'In Progress',
      color: '#000000',
      description: null,
      active: true,
      created_on: '2023-01-01',
      updated_on: null
    }
  ];

  const mockFormData: TaskFormState = {
    name: '',
    description: '',
    project_id: null,
    type_id: null,
    priority_id: null,
    status_id: 1,
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
    statuses: mockStatuses,
    handleChange: mockHandleChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders status select field correctly', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('displays all status options', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const select = screen.getByLabelText('Status');
    fireEvent.mouseDown(select);
    
    mockStatuses.forEach(status => {
      expect(screen.getByText(status.name)).toBeInTheDocument();
    });
  });

  it('shows the selected status', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const select = screen.getByLabelText('Status') as HTMLInputElement;
    expect(select.value).toBe('1');
  });

  it('calls handleChange when a new status is selected', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const select = screen.getByLabelText('Status');
    
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('In Progress'));

    expect(mockHandleChange).toHaveBeenCalled();
  });

  it('has required attribute', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const select = screen.getByLabelText('Status');
    expect(select).toBeRequired();
  });

  it('renders as full width', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const textField = screen.getByLabelText('Status').closest('.MuiTextField-root');
    expect(textField).toHaveStyle({ width: '100%' });
  });

  it('has proper margin bottom styling', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const textField = screen.getByLabelText('Status').closest('.MuiTextField-root');
    expect(textField).toHaveStyle({ marginBottom: '16px' });
  });
});