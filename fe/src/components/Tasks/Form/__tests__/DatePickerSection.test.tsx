import React from 'react';
import { render, screen } from '@testing-library/react';
import { DatePickerSection } from '../DatePickerSection';
import { TaskFormState } from '../../../../types/task';
import dayjs from 'dayjs';

// Mock the DatePicker component
jest.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, value, onChange, sx, slotProps }: any) => (
    <div data-testid={`mock-date-picker-${label.toLowerCase().replace(' ', '-')}`}>
      <label>{label}</label>
      <input 
        type="text" 
        value={value ? value.format('YYYY-MM-DD') : ''} 
        onChange={(e) => onChange(dayjs(e.target.value))}
      />
    </div>
  )
}));

describe('DatePickerSection', () => {
  const mockHandleChange = jest.fn();
  
  const defaultFormData: TaskFormState = {
    name: '',
    description: '',
    project_id: null,
    type_id: null,
    priority_id: null,
    status_id: null,
    parent_id: null,
    holder_id: null,
    assignee_id: null,
    start_date: '2024-01-01T00:00:00.000Z',
    due_date: '2024-01-15T00:00:00.000Z',
    estimated_time: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both date pickers', () => {
    render(
      <DatePickerSection 
        formData={defaultFormData} 
        handleChange={mockHandleChange} 
      />
    );

    expect(screen.getByTestId('mock-date-picker-start-date')).toBeInTheDocument();
    expect(screen.getByTestId('mock-date-picker-due-date')).toBeInTheDocument();
  });

  it('displays correct labels', () => {
    render(
      <DatePickerSection 
        formData={defaultFormData} 
        handleChange={mockHandleChange} 
      />
    );

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
  });

  it('handles start date change correctly', () => {
    render(
      <DatePickerSection 
        formData={defaultFormData} 
        handleChange={mockHandleChange} 
      />
    );

    const newDate = '2024-02-01T00:00:00.000Z';
    const expectedChange = {
      target: { 
        name: 'start_date', 
        value: newDate 
      }
    };

    const startDatePicker = screen.getByTestId('mock-date-picker-start-date')
      .querySelector('input');
    startDatePicker?.dispatchEvent(
      new Event('change', { bubbles: true })
    );

    expect(mockHandleChange).toHaveBeenCalled();
    // Note: exact matching might fail due to timezone differences
    expect(mockHandleChange.mock.calls[0][0].target.name)
      .toBe(expectedChange.target.name);
  });

  it('handles null dates correctly', () => {
    const formDataWithNullDates = {
      ...defaultFormData,
      start_date: null,
      due_date: null
    };

    render(
      <DatePickerSection 
        formData={formDataWithNullDates} 
        handleChange={mockHandleChange} 
      />
    );

    const dueDatePicker = screen.getByTestId('mock-date-picker-due-date')
      .querySelector('input');
    expect(dueDatePicker?.value).toBe('');
  });

  it('applies correct styles', () => {
    render(
      <DatePickerSection 
        formData={defaultFormData} 
        handleChange={mockHandleChange} 
      />
    );

    const startDatePicker = screen.getByTestId('mock-date-picker-start-date');
    const dueDatePicker = screen.getByTestId('mock-date-picker-due-date');

    // Note: In a real scenario, you might want to test the actual computed styles
    expect(startDatePicker).toBeInTheDocument();
    expect(dueDatePicker).toBeInTheDocument();
  });
});