import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserDialog from '../UserDialog';
import { useUserDialog } from '../../../hooks/setting/useUserDialog';
import { User } from '../../../types/user';
import userEvent from '@testing-library/user-event';

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
    
    expect(screen.getByText('Create New User')).toBeInTheDocument();
    expect(screen.getByLabelText('Login')).toBeEnabled();
    expect(screen.getByLabelText('Password')).toBeRequired();
  });

  it('renders edit user dialog correctly', () => {
    render(<UserDialog {...defaultProps} user={mockUser} />);
    
    expect(screen.getByText(`Edit user ${mockUser.name} ${mockUser.surname}`)).toBeInTheDocument();
    expect(screen.getByLabelText('Login')).toBeDisabled();
    expect(screen.getByLabelText('New Password (leave empty to keep current)')).not.toBeRequired();
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
    
    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);
    
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<UserDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows correct role options', () => {
    render(<UserDialog {...defaultProps} />);
    
    const roleSelect = screen.getByLabelText('Role');
    fireEvent.mouseDown(roleSelect);
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    expect(screen.getByText('Devleoper')).toBeInTheDocument();
    expect(screen.getByText('Reporter')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<UserDialog {...defaultProps} />);
    
    const requiredFields = [
      'Login',
      'First Name',
      'Last Name',
      'Email',
      'Password'
    ];

    requiredFields.forEach(fieldLabel => {
      const field = screen.getByLabelText(fieldLabel);
      expect(field).toBeRequired();
    });
  });

  it('pre-fills form data for existing user', () => {
    render(<UserDialog {...defaultProps} user={mockUser} />);
    
    expect(screen.getByLabelText('Login')).toHaveValue(mockUser.login);
    expect(screen.getByLabelText('First Name')).toHaveValue(mockUser.name);
    expect(screen.getByLabelText('Last Name')).toHaveValue(mockUser.surname);
    expect(screen.getByLabelText('Email')).toHaveValue(mockUser.email);
  });
});