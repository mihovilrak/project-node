// src/integration/__tests__/auth-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../components/Auth/Login';
import { TestWrapper } from '../TestWrapper';

describe('Authentication Flow', () => {
  it('should handle login flow correctly', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    // Get form elements
    const loginInput = screen.getByLabelText(/login/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill in the form
    await userEvent.type(loginInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');

    // Submit the form
    await userEvent.click(submitButton);

    // Wait for and verify success state - redirects to root (/) as per useLogin hook
    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });

  it('should display error message for invalid credentials', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const loginInput = screen.getByLabelText(/login/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(loginInput, 'wronguser');
    await userEvent.type(passwordInput, 'wrongpass');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login error. Please try again.')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitButton);

    // Check if form validation prevents submission of empty fields
    expect(screen.getByLabelText(/login/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });

  it('should toggle password visibility', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    // Password should be hidden by default
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    await userEvent.click(toggleButton);

    // Password should be visible
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle button again
    await userEvent.click(toggleButton);

    // Password should be hidden again
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});