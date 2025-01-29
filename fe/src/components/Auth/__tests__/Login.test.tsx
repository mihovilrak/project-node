import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import Login from '../Login';

// Mock the useLogin hook
jest.mock('../../../hooks/auth/useLogin', () => ({
  useLogin: () => ({
    loginDetails: { login: '', password: '' },
    error: '',
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn((e) => e.preventDefault()),
  }),
}));

describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('password visibility toggle works', () => {
    render(<Login />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const visibilityToggle = screen.getByRole('button', {
      name: /toggle password visibility/i,
    });

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(visibilityToggle);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(visibilityToggle);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('form inputs are required', () => {
    render(<Login />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(usernameInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  test('displays error message when provided', () => {
    const errorMessage = 'Invalid credentials';
    jest.mock('../../../hooks/auth/useLogin', () => ({
      useLogin: () => ({
        loginDetails: { login: '', password: '' },
        error: errorMessage,
        handleInputChange: jest.fn(),
        handleSubmit: jest.fn(),
      }),
    }));

    render(<Login />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('form submission handler is called', () => {
    const mockHandleSubmit = jest.fn((e) => e.preventDefault());
    jest.mock('../../../hooks/auth/useLogin', () => ({
      useLogin: () => ({
        loginDetails: { login: '', password: '' },
        error: '',
        handleInputChange: jest.fn(),
        handleSubmit: mockHandleSubmit,
      }),
    }));

    render(<Login />);
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});