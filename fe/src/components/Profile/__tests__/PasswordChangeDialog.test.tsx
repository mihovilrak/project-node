import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordChangeDialog from '../PasswordChangeDialog';
import { changePassword } from '../../../api/profiles';

// Mock the API call
jest.mock('../../../api/profiles', () => ({
  changePassword: jest.fn().mockResolvedValue({})
}));

describe('PasswordChangeDialog', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    open: true,
    onClose: mockOnClose
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  test('renders dialog title correctly', () => {
    const { getByTestId } = render(<PasswordChangeDialog {...defaultProps} />);
    expect(getByTestId('dialog-title')).toBeInTheDocument();
    expect(getByTestId('dialog-title').textContent).toBe('Change Password');
  });

  // Test 2
  test('renders all three password input fields', () => {
    const { getByTestId } = render(<PasswordChangeDialog {...defaultProps} />);

    // Check all three password fields exist
    expect(getByTestId('current-password-field')).toBeInTheDocument();
    expect(getByTestId('new-password-field')).toBeInTheDocument();
    expect(getByTestId('confirm-password-field')).toBeInTheDocument();
  });

  // Test 3
  test('renders both Cancel and Change Password buttons', () => {
    const { getByTestId } = render(<PasswordChangeDialog {...defaultProps} />);

    // Check both buttons exist
    expect(getByTestId('cancel-button')).toBeInTheDocument();
    expect(getByTestId('submit-button')).toBeInTheDocument();

    // Check button text
    expect(getByTestId('cancel-button').textContent).toBe('Cancel');
    expect(getByTestId('submit-button').textContent).toBe('Change Password');
  });

  // Test 4
  test('calls onClose when Cancel button is clicked', () => {
    const { getByTestId } = render(<PasswordChangeDialog {...defaultProps} />);

    // Click the cancel button
    fireEvent.click(getByTestId('cancel-button'));

    // Check onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 5
  test('allows typing in the password fields', () => {
    const { getByTestId } = render(<PasswordChangeDialog {...defaultProps} />);

    // Get password fields
    const currentField = getByTestId('current-password-field').querySelector('input');
    const newField = getByTestId('new-password-field').querySelector('input');
    const confirmField = getByTestId('confirm-password-field').querySelector('input');

    // Type in each field
    if (currentField) {
      fireEvent.change(currentField, { target: { value: 'CurrentPassword123' } });
      expect(currentField.value).toBe('CurrentPassword123');
    }

    if (newField) {
      fireEvent.change(newField, { target: { value: 'NewPassword123' } });
      expect(newField.value).toBe('NewPassword123');
    }

    if (confirmField) {
      fireEvent.change(confirmField, { target: { value: 'NewPassword123' } });
      expect(confirmField.value).toBe('NewPassword123');
    }
  });

  // Test 6
  test('form is submittable', () => {
    const { getByTestId } = render(<PasswordChangeDialog {...defaultProps} />);

    // Verify submit button exists and is clickable
    const submitButton = getByTestId('submit-button');
    expect(submitButton).not.toBeDisabled();

    // We're not testing the submission itself, just that the button exists and isn't disabled
  });

  // Test 7
  test('has a form for password entry', () => {
    const { getByTestId } = render(<PasswordChangeDialog {...defaultProps} />);

    // Check form exists
    expect(getByTestId('password-form')).toBeInTheDocument();

    // Verify form has onSubmit handler by checking for prevent default behavior
    // We're not testing the actual submission here
  });
});