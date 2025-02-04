import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Login from '../Login';

const mockLogin = jest.fn();

// Mock the auth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    logout: jest.fn()
  })
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login />);
    
    // Check for heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Login');
    
    // Check for input fields using exact label text
    const usernameField = screen.getByLabelText(/Username/);
    const passwordField = screen.getByLabelText(/Password/);
    expect(usernameField).toBeInTheDocument();
    expect(passwordField).toBeInTheDocument();
    
    // Check for login button
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  test('password visibility toggle works', async () => {
    render(<Login />);
    const user = userEvent.setup();
    
    const passwordInput = screen.getByLabelText(/Password/);
    const visibilityToggle = screen.getByRole('button', {
      name: /toggle password visibility/i,
    });

    // Initial state - password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click visibility toggle
    await user.click(visibilityToggle);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click visibility toggle again
    await user.click(visibilityToggle);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('form inputs have required attribute', () => {
    render(<Login />);
    
    const usernameInput = screen.getByLabelText(/Username/);
    const passwordInput = screen.getByLabelText(/Password/);

    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  test('displays error message when provided', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Login failed'));
    render(<Login />);
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/Username/), 'testuser');
    await user.type(screen.getByLabelText(/Password/), 'testpass');
    await user.click(screen.getByRole('button', { name: /^login$/i }));

    const errorMessage = await screen.findByText('Login error. Please try again.');
    expect(errorMessage).toBeInTheDocument();
  });

  test('form submission handler is called', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<Login />);
    const user = userEvent.setup();
    
    // Fill out the form
    await user.type(screen.getByLabelText(/Username/), 'testuser');
    await user.type(screen.getByLabelText(/Password/), 'testpass');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /^login$/i }));
    
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass');
  });
});