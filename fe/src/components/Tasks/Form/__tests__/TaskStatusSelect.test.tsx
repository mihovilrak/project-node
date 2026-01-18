import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    expect(screen.getByRole('combobox', { name: /Status/i })).toBeInTheDocument();
  });

  it('displays all status options', async () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const select = screen.getByRole('combobox', { name: /Status/i });
    fireEvent.mouseDown(select);

    const options = await screen.findAllByRole('option');
    const optionTexts = options.map(opt => opt.textContent);
    mockStatuses.forEach(status => {
      expect(optionTexts).toContain(status.name);
    });
  });

  it('shows the selected status', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    // Check the visible value in the select's display element
    const selectDisplay = document.querySelector('.MuiSelect-select');
    expect(selectDisplay).toBeTruthy();
    expect(selectDisplay?.textContent).toBe('New'); // defaultProps.status_id is 1, which is 'New'
  });

  it('calls handleChange when a new status is selected', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const select = screen.getByRole('combobox', { name: /Status/i });

    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('In Progress'));

    expect(mockHandleChange).toHaveBeenCalled();
  });

  it('has required attribute', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const select = screen.getByRole('combobox', { name: /Status/i });
    expect(select).toBeRequired();
  });

  it('renders as full width', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const textField = screen.getByRole('combobox', { name: /Status/i }).closest('.MuiTextField-root');
    expect(textField).toHaveStyle({ width: '100%' });
  });

  it('has proper margin bottom styling', () => {
    render(<TaskStatusSelect {...defaultProps} />);
    const textField = screen.getByRole('combobox', { name: /Status/i }).closest('.MuiTextField-root');
    expect(textField).toHaveStyle({ marginBottom: '16px' });
  });
});