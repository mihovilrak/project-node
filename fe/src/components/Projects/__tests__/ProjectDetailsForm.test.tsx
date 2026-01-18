import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ProjectDetailsForm from '../ProjectDetailsForm';
import { Project } from '../../../types/project';

// Mock date picker with data-testid attribute for easier testing
jest.mock('@mui/x-date-pickers', () => ({
  ...jest.requireActual('@mui/x-date-pickers'),
  DatePicker: ({ label, onChange, value }: { label: string; onChange: (date: any) => void; value: any }) => (
    <div data-testid={`date-picker-${label}`}>
      <label htmlFor={`date-input-${label}`}>{label}</label>
      <input
        type="date"
        id={`date-input-${label}`}
        data-testid="date-input"
        onChange={(e) => onChange(dayjs(e.target.value))}
        value={value ? value.format('YYYY-MM-DD') : ''}
      />
    </div>
  ),
}));

const mockAvailableProjects = [
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

describe('ProjectDetailsForm', () => {
  const renderForm = (props = {}) => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ProjectDetailsForm {...defaultProps} {...props} />
      </LocalizationProvider>
    );
  };

  test('renders the form with all required fields', () => {
    renderForm();

    expect(screen.getByText('Project Details')).toBeInTheDocument();

    expect(screen.getByRole('textbox', { name: /project name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();

    expect(screen.getByTestId('date-picker-Start Date')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-Due Date')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  test('displays validation errors when provided', () => {
    renderForm({
      errors: { name: 'Name is required' },
      dateError: 'Invalid date range'
    });

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid date range')).toBeInTheDocument();
  });

  test('calls handleChange when text input changes', () => {
    renderForm();
    const nameInput = screen.getByRole('textbox', { name: /project name/i });

    fireEvent.change(nameInput, { target: { value: 'New Project' } });
    expect(defaultProps.handleChange).toHaveBeenCalled();
  });

  test('calls handleDateChange when date input changes', () => {
    renderForm();
    const startDateContainer = screen.getByTestId('date-picker-Start Date');
    const dateInput = startDateContainer.querySelector('input[data-testid="date-input"]');

    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2023-01-01' } });
      expect(defaultProps.handleDateChange).toHaveBeenCalledWith('start_date', expect.any(Object));
    } else {
      throw new Error('Date input not found');
    }
  });

  test('calls onSubmit when Next button is clicked', () => {
    renderForm();
    const nextButton = screen.getByRole('button', { name: /next/i });

    fireEvent.click(nextButton);
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  test('calls handleCancel when Cancel button is clicked', () => {
    renderForm();
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    fireEvent.click(cancelButton);
    expect(defaultProps.handleCancel).toHaveBeenCalled();
  });
});
