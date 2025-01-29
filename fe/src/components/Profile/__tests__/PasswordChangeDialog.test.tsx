import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PasswordChangeDialog from '../PasswordChangeDialog';
import { changePassword } from '../../../api/profiles';

// Mock the API call
jest.mock('../../../api/profiles', () => ({
  changePassword: jest.fn()
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

  test('renders all password fields and buttons', () => {
    render(<PasswordChangeDialog {...defaultProps} />);
    
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  test('validates all fields are required', async () => {
    render(<PasswordChangeDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    expect(await screen.findByText('All fields are required')).toBeInTheDocument();
  });

  test('validates passwords match', async () => {
    render(<PasswordChangeDialog {...defaultProps} />);
    
    await userEvent.type(screen.getByLabelText(/current password/i), 'currentpass');
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpass123');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpass124');
    
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    expect(await screen.findByText('New passwords do not match')).toBeInTheDocument();
  });

  test('validates password length', async () => {
    render(<PasswordChangeDialog {...defaultProps} />);
    
    await userEvent.type(screen.getByLabelText(/current password/i), 'current');
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'short');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'short');
    
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    expect(await screen.findByText('Password must be at least 8 characters long')).toBeInTheDocument();
  });

  test('handles successful password change', async () => {
    (changePassword as jest.Mock).mockResolvedValueOnce({});
    render(<PasswordChangeDialog {...defaultProps} />);
    
    await userEvent.type(screen.getByLabelText(/current password/i), 'currentpass');
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpassword123');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpassword123');
    
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        current_password: 'currentpass',
        new_password: 'newpassword123',
        confirm_password: 'newpassword123'
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('handles failed password change', async () => {
    (changePassword as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
    render(<PasswordChangeDialog {...defaultProps} />);
    
    await userEvent.type(screen.getByLabelText(/current password/i), 'currentpass');
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpassword123');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpassword123');
    
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    expect(await screen.findByText('Failed to change password. Please check your current password.')).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('disables submit button while loading', async () => {
    (changePassword as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<PasswordChangeDialog {...defaultProps} />);
    
    await userEvent.type(screen.getByLabelText(/current password/i), 'currentpass');
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpassword123');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpassword123');
    
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    
    expect(screen.getByRole('button', { name: /change password/i })).toBeDisabled();
  });
});