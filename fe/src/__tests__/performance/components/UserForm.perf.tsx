import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Profiler } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import UserForm from '../../../components/Users/UserForm';
import { createAppTheme } from '../../../theme/theme';

// Mock the API module to prevent real HTTP calls
jest.mock('../../../api/api');

// Mock AuthContext to prevent session checks
jest.mock('../../../context/AuthContext', () => ({
  ...jest.requireActual('../../../context/AuthContext'),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    currentUser: { id: 1, name: 'Test User' },
    hasPermission: () => true,
    permissionsLoading: false,
    userPermissions: [{ permission: 'Admin' }]
  })
}));

// Mock useUserForm hook
jest.mock('../../../hooks/user/useUserForm', () => ({
  useUserForm: () => ({
    loading: false,
    error: null,
    fieldErrors: {},
    roles: [
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Developer' },
      { id: 3, name: 'User' }
    ],
    formValues: {
      login: '',
      name: '',
      surname: '',
      email: '',
      role_id: 1,
      password: '',
      confirmPassword: '',
      currentPassword: ''
    },
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn((e: React.FormEvent) => e.preventDefault())
  })
}));

// Custom test wrapper
const PerfTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createAppTheme('light');
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Performance measurement callback
const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  console.log(`Component: ${id}`);
  console.log(`Phase: ${phase}`);
  console.log(`Actual Duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base Duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Commit Time: ${commitTime}ms`);
  console.log('-------------------');
};

describe('UserForm Component Performance Tests', () => {
  // Helper function to measure render performance
  const measurePerformance = (Component: React.ComponentType<any>, props = {}) => {
    const start = performance.now();

    render(
      <PerfTestWrapper>
        <Profiler id={Component.name} onRender={onRenderCallback}>
          <Component {...props} />
        </Profiler>
      </PerfTestWrapper>
    );

    const end = performance.now();
    return end - start;
  };

  // Test initial render performance
  test('UserForm component initial render performance', () => {
    const renderTime = measurePerformance(UserForm);
    expect(renderTime).toBeLessThan(2000); // Should render under 2000ms
  });

  // Test form input performance
  test('UserForm input field interactions performance', () => {
    render(
      <PerfTestWrapper>
        <Profiler id="UserForm-Input" onRender={onRenderCallback}>
          <UserForm />
        </Profiler>
      </PerfTestWrapper>
    );

    const start = performance.now();

    // Use fireEvent.change instead of slow userEvent.type for performance testing
    const nameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    const end = performance.now();
    const inputTime = end - start;

    expect(inputTime).toBeLessThan(1000); // Input change should be under 1000ms (accounting for parallel test runs)
  });

  // Test form submission performance
  test('UserForm submission performance', () => {
    render(
      <PerfTestWrapper>
        <Profiler id="UserForm-Submit" onRender={onRenderCallback}>
          <UserForm />
        </Profiler>
      </PerfTestWrapper>
    );

    const start = performance.now();

    // Use fireEvent.click instead of async userEvent.click for performance testing
    const submitButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(submitButton);

    const end = performance.now();
    const submitTime = end - start;

    expect(submitTime).toBeLessThan(1500); // Click should be under 1500ms (accounting for test environment variability)
  });
});
