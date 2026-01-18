import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserDialog from '../UserDialog';
import { useUserDialog } from '../../../hooks/setting/useUserDialog';
import { User } from '../../../types/user';

// Mock the custom hook
jest.mock('../../../hooks/setting/useUserDialog');

const mockUseUserDialog = useUserDialog as jest.Mock;

const mockUser: User = {
  id: 1,
  login: 'testuser',
  name: 'Test',
  surname: 'User',
  email: 'test@example.com',
  role_id: 2,
  status_id: 1,
  created_on: '2023-01-01',
  avatar_url: null,
  updated_on: null,
  last_login: null
};

const mockFormData = {
  login: 'testuser',
  name: 'Test',
  surname: 'User',
  email: 'test@example.com',
  password: '',
  role_id: 2,
  status_id: 1
};

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  onUserSaved: jest.fn(),
  user: undefined
};

describe('UserDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserDialog.mockReturnValue({
      formData: mockFormData,
      error: null,
      handleTextChange: jest.fn(),
      handleRoleChange: jest.fn(),
      handleSubmit: jest.fn()
    });
  });

  it('renders create user dialog correctly', () => {
    render(<UserDialog {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Create New User' })).toBeInTheDocument();

    // Using more reliable selectors
    const loginInput = screen.getByRole('textbox', { name: /login/i });
    expect(loginInput).toBeEnabled();

    // For password fields, use direct DOM query
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    expect(passwordInputs[0]).toBeRequired();
  });

  it('renders edit user dialog correctly', () => {
    render(<UserDialog {...defaultProps} user={mockUser} />);

    expect(screen.getByRole('heading', { name: `Edit user ${mockUser.name} ${mockUser.surname}` })).toBeInTheDocument();

    const loginInput = screen.getByRole('textbox', { name: /login/i });
    expect(loginInput).toBeDisabled();

    const passwordInputs = document.querySelectorAll('input[type="password"]');
    expect(passwordInputs[0]).not.toBeRequired();
  });

  it('displays error message when error exists', () => {
    const errorMessage = 'Test error message';
    mockUseUserDialog.mockReturnValue({
      formData: mockFormData,
      error: errorMessage,
      handleTextChange: jest.fn(),
      handleRoleChange: jest.fn(),
      handleSubmit: jest.fn()
    });

    render(<UserDialog {...defaultProps} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const mockHandleSubmit = jest.fn((e) => e.preventDefault());
    mockUseUserDialog.mockReturnValue({
      formData: mockFormData,
      error: null,
      handleTextChange: jest.fn(),
      handleRoleChange: jest.fn(),
      handleSubmit: mockHandleSubmit
    });

    render(<UserDialog {...defaultProps} />);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<UserDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows correct role options', async () => {
    render(<UserDialog {...defaultProps} />);

    // Open the select dropdown
    const roleSelect = screen.getByLabelText(/role/i);
    fireEvent.mouseDown(roleSelect);

    // Wait for options to appear in the dropdown
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Manager' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'User' })).toBeInTheDocument();
    });
  });

  it('validates required fields in create mode', () => {
    render(<UserDialog {...defaultProps} />);

    // For text fields
    expect(screen.getByRole('textbox', { name: /login/i })).toBeRequired();
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeRequired();
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeRequired();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeRequired();

    // For password field
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    expect(passwordInputs[0]).toBeRequired();
  });

  it('pre-fills form data for existing user', () => {
    render(<UserDialog {...defaultProps} user={mockUser} />);

    expect(screen.getByRole('textbox', { name: /login/i })).toHaveValue(mockUser.login);
    expect(screen.getByRole('textbox', { name: /first name/i })).toHaveValue(mockUser.name);
    expect(screen.getByRole('textbox', { name: /last name/i })).toHaveValue(mockUser.surname);
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue(mockUser.email);
  });
});