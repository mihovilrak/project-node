import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Login from '../../components/Auth/Login';
import { api } from '../../api/api';
import { TestWrapper } from '../TestWrapper';

// Mock the api module
jest.mock('../../api/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  }
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for check-session (called by AuthProvider on mount)
    mockedApi.get.mockResolvedValue({ status: 200, data: {} });
  });

  it('should handle login flow correctly', async () => {
    // Mock successful login
    mockedApi.post.mockResolvedValueOnce({
      status: 200,
      data: { user: { id: 1, name: 'Test User' } }
    });
    // Mock permissions fetch after login
    mockedApi.get.mockResolvedValueOnce({ status: 200, data: {} }); // check-session
    mockedApi.get.mockResolvedValueOnce({ status: 200, data: [] }); // permissions

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    // Get form elements
    const loginInput = screen.getByTestId('login-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit');

    // Fill in the form using fireEvent.change (faster than userEvent.type)
    fireEvent.change(loginInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for and verify success state - redirects to root (/) as per useLogin hook
    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });

  it('should display error message for invalid credentials', async () => {
    // Mock /check-session to resolve with no user
    mockedApi.get.mockResolvedValueOnce({ status: 200, data: {} });
    // Mock /login to reject with a 401 error (simulate missing user)
    mockedApi.post.mockRejectedValueOnce({
      response: { status: 401, data: {} }
    });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const loginInput = screen.getByTestId('login-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-submit');

    // Fill in the form using fireEvent.change (faster than userEvent.type)
    fireEvent.change(loginInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    let errorElem: HTMLElement | null = null;
    try {
      await waitFor(() => {
        errorElem = screen.getByTestId('login-error');
        expect(errorElem).toBeInTheDocument();
        expect(errorElem!.textContent).not.toBe("");
      });
    } catch (e) {
      // Log DOM for diagnosis if error element not found
      // eslint-disable-next-line no-console
      console.log('DEBUG: Rendered DOM:', document.body.innerHTML);
      throw e;
    }
  });

  it('should validate required fields', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('login-submit');
    fireEvent.click(submitButton);

    // Check if form validation prevents submission of empty fields
    expect(screen.getByTestId('login-input')).toBeRequired();
    expect(screen.getByTestId('password-input')).toBeRequired();
  });

  it('should toggle password visibility', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByTestId('toggle-password-visibility');

    // Password should be hidden by default
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    fireEvent.click(toggleButton);

    // Password should be visible
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle button again
    fireEvent.click(toggleButton);

    // Password should be hidden again
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});