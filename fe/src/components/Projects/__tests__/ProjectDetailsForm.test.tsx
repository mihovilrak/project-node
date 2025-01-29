import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ProjectDetailsForm from '../ProjectDetailsForm';
import { Project } from '../../../types/project';

// Mock the date picker to avoid full implementation
jest.mock('@mui/x-date-pickers', () => ({
  ...jest.requireActual('@mui/x-date-pickers'),
  DatePicker: ({ label, onChange, value }: any) => (
    <input
      type="date"
      data-testid={`date-picker-${label.toLowerCase().replace(' ', '-')}`}
      onChange={(e) => onChange(dayjs(e.target.value))}
      value={value ? value.format('YYYY-MM-DD') : ''}
    />
  ),
}));

const mockAvailableProjects: Project[] = [
  { id: 1, name: 'Project 1' },
  { id: 2, name: 'Project 2' },
] as Project[];

const defaultProps = {
  formData: {
    name: '',
    description: '',
    start_date: '',
    due_date: '',
    status_id: 1,
    parent_id: null
  },
  errors: {},
  dateError: '',
  availableProjects: mockAvailableProjects,
  parentId: null,
  handleChange: jest.fn(),
  handleStatusChange: jest.fn(),
  handleDateChange: jest.fn(),
  handleParentChange: jest.fn(),
  handleCancel: jest.fn(),
  onSubmit: jest.fn()
};

const renderForm = (props = {}) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ProjectDetailsForm {...defaultProps} {...props} />
    </LocalizationProvider>
  );
};

describe('ProjectDetailsForm', () => {
  it('renders all form fields', () => {
    renderForm();
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-start-date')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-due-date')).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parent project/i)).toBeInTheDocument();
  });

  it('displays validation errors', () => {
    renderForm({
      errors: { name: 'Name is required' },
      dateError: 'Invalid date range'
    });
    
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid date range')).toBeInTheDocument();
  });

  it('handles name input change', () => {
    renderForm();
    const nameInput = screen.getByLabelText(/project name/i);
    fireEvent.change(nameInput, { target: { value: 'New Project' } });
    expect(defaultProps.handleChange).toHaveBeenCalled();
  });

  it('handles date changes', () => {
    renderForm();
    const startDatePicker = screen.getByTestId('date-picker-start-date');
    fireEvent.change(startDatePicker, { target: { value: '2023-01-01' } });
    expect(defaultProps.handleDateChange).toHaveBeenCalledWith('start_date', expect.any(Object));
  });

  it('handles status change', () => {
    renderForm();
    const statusSelect = screen.getByLabelText(/status/i);
    fireEvent.mouseDown(statusSelect);
    const option = screen.getByText('On Hold');
    fireEvent.click(option);
    expect(defaultProps.handleStatusChange).toHaveBeenCalled();
  });

  it('disables parent project select when parentId is provided', () => {
    renderForm({ parentId: 1 });
    expect(screen.getByLabelText(/parent project/i)).toBeDisabled();
  });

  it('renders available projects in parent project select', () => {
    renderForm();
    const parentSelect = screen.getByLabelText(/parent project/i);
    fireEvent.mouseDown(parentSelect);
    mockAvailableProjects.forEach(project => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    });
  });

  it('calls onSubmit when Next button is clicked', () => {
    renderForm();
    const submitButton = screen.getByText('Next');
    fireEvent.click(submitButton);
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('calls handleCancel when Cancel button is clicked', () => {
    renderForm();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(defaultProps.handleCancel).toHaveBeenCalled();
  });
});