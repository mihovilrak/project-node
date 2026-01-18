import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActivityTypeDialog from '../ActivityTypeDialog';
import { ActivityType, ActivityTypeFormData } from '../../../types/setting';
import { useActivityTypeDialog } from '../../../hooks/setting/useActivityTypeDialog';

// Mock the mui-color-input module to fix the import error
jest.mock('mui-color-input', () => ({
  MuiColorInput: ({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) => (
    <div data-testid={`color-input-${label}`}>
      <label htmlFor={`color-input-field-${label}`}>{label}</label>
      <input
        type="text"
        id={`color-input-field-${label}`}
        data-testid="color-input-field"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      />
    </div>
  ),
}));

// Mock the useIconSelector hook used in ActivityTypeForm
jest.mock('../../../hooks/setting/useIconSelector', () => ({
  useIconSelector: () => ({
    icons: ['icon1', 'icon2'],
    open: false,
    handleOpen: jest.fn(),
    handleClose: jest.fn(),
    handleSelect: jest.fn()
  })
}));

jest.mock('../../../hooks/setting/useActivityTypeDialog');
const mockUseActivityTypeDialog = useActivityTypeDialog as jest.Mock;

describe('ActivityTypeDialog', () => {
  const mockFormData: ActivityTypeFormData = {
    name: 'Test Activity',
    color: '#000000',
    description: 'Test Description',
    active: true,
    icon: 'test_icon'
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActivityTypeDialog.mockReturnValue({
      formData: mockFormData,
      error: undefined,
      handleChange: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
      handleSubmit: jest.fn()
    });
  });

  it('renders create dialog when no activity type provided', () => {
    render(<ActivityTypeDialog {...defaultProps} />);
    expect(screen.getByText('Create Activity Type')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('renders edit dialog with activity type', () => {
    const activityType: ActivityType = {
      id: 1,
      name: 'Test Activity',
      color: '#000000',
      description: 'Test Description',
      active: true,
      icon: 'test_icon'
    };

    render(<ActivityTypeDialog {...defaultProps} activityType={activityType} />);
    expect(screen.getByText('Edit Activity Type')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('handles successful form submission', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<ActivityTypeDialog {...defaultProps} onSave={onSave} />);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(mockFormData);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('handles form submission error', async () => {
    const error = new Error('API Error');
    Object.assign(error, { response: { data: { error: 'Failed to save' } } });
    const onSave = jest.fn().mockRejectedValue(error);

    const mockSetError = jest.fn();
    mockUseActivityTypeDialog.mockReturnValue({
      formData: mockFormData,
      error: undefined,
      handleChange: jest.fn(),
      setError: mockSetError,
      clearError: jest.fn()
    });

    render(<ActivityTypeDialog {...defaultProps} onSave={onSave} />);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Failed to save');
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  it('closes dialog on cancel', () => {
    render(<ActivityTypeDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});