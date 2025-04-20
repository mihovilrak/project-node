import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityTypeForm } from '../ActivityTypeForm';
import { useIconSelector } from '../../../hooks/setting/useIconSelector';

// Mock the hooks and external components
jest.mock('../../../hooks/setting/useIconSelector');
jest.mock('mui-color-input', () => ({
  MuiColorInput: ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void 
  }) => (
    <input
      data-testid="color-input"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const mockUseIconSelector = useIconSelector as jest.Mock;

describe('ActivityTypeForm', () => {
  const defaultFormData = {
    name: 'Test Activity',
    color: '#000000',
    description: 'Test Description',
    active: true,
    icon: 'test_icon'
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIconSelector.mockReturnValue({
      icons: ['icon1', 'icon2'],
      open: false,
      value: 'test_icon',
      handleOpen: jest.fn(),
      handleClose: jest.fn(),
      handleSelect: jest.fn(),
    });
  });

  it('renders all form fields correctly', () => {
    render(<ActivityTypeForm formData={defaultFormData} onChange={mockOnChange} />);
    
    // Use more specific queries that work better with Material-UI
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByTestId('color-input')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    // For the switch, look for the span containing 'Active' text
    expect(screen.getByText('Active')).toBeInTheDocument();
    // For the icon label
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('handles name input change', () => {
    render(<ActivityTypeForm formData={defaultFormData} onChange={mockOnChange} />);
    
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    fireEvent.change(nameInput, { target: { value: 'New Activity Name' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('name', 'New Activity Name');
  });

  it('handles color input change', () => {
    render(<ActivityTypeForm formData={defaultFormData} onChange={mockOnChange} />);
    
    const colorInput = screen.getByTestId('color-input');
    fireEvent.change(colorInput, { target: { value: '#FF0000' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('color', '#FF0000');
  });

  it('handles description input change', () => {
    render(<ActivityTypeForm formData={defaultFormData} onChange={mockOnChange} />);
    
    const descriptionInput = screen.getByRole('textbox', { name: /description/i });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('description', 'New Description');
  });

  it('handles active switch toggle', () => {
    render(<ActivityTypeForm formData={defaultFormData} onChange={mockOnChange} />);
    
    // Find the switch by looking for the container with the 'Active' label
    const activeLabel = screen.getByText('Active');
    const formControlLabel = activeLabel.closest('.MuiFormControlLabel-root');
    expect(formControlLabel).not.toBeNull();
    const activeSwitch = formControlLabel!.querySelector('input[type="checkbox"]');
    expect(activeSwitch).not.toBeNull();
    fireEvent.click(activeSwitch!);
    
    expect(mockOnChange).toHaveBeenCalledWith('active', false);
  });

  it('renders icon selector with current value', () => {
    render(<ActivityTypeForm formData={defaultFormData} onChange={mockOnChange} />);
    
    // Find the icon by its text content inside the span with material-icons class
    const iconElement = screen.getByText('test_icon');
    expect(iconElement).toBeInTheDocument();
    // Verify it's inside a button
    const buttonElement = iconElement.closest('button');
    expect(buttonElement).not.toBeNull();
  });

  it('marks required fields', () => {
    render(<ActivityTypeForm formData={defaultFormData} onChange={mockOnChange} />);
    
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    const colorInput = screen.getByTestId('color-input');
    
    expect(nameInput).toHaveAttribute('required');
    expect(colorInput).toBeInTheDocument();
  });
});