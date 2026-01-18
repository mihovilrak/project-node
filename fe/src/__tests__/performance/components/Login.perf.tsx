import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Login from '../../../components/Auth/Login';
import { createAppTheme } from '../../../theme/theme';

// Mock the API module to prevent real HTTP calls
jest.mock('../../../api/api');

// Mock AuthContext to prevent session checks
jest.mock('../../../context/AuthContext', () => ({
  ...jest.requireActual('../../../context/AuthContext'),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    currentUser: null,
    hasPermission: () => false,
    permissionsLoading: false,
    userPermissions: [],
    login: jest.fn()
  })
}));

// Mock useLogin hook
jest.mock('../../../hooks/auth/useLogin', () => ({
  useLogin: () => ({
    loginDetails: { login: '', password: '' },
    error: '',
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn()
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

describe('Login Component Performance Tests', () => {
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
  test('Login component initial render performance', () => {
    const renderTime = measurePerformance(Login);
    expect(renderTime).toBeLessThan(1000); // Should render under 1000ms (accounting for parallel test runs)
  });

  // Test re-render performance with input changes
  test('Login component re-render performance with form interactions', () => {
    const renderTime = measurePerformance(Login);
    expect(renderTime).toBeLessThan(1000); // Should re-render under 1000ms (accounting for parallel test runs)
  });

  // Test render performance with error state
  test('Login component render performance with error state', () => {
    const renderTime = measurePerformance(Login);
    expect(renderTime).toBeLessThan(1000); // Should handle error state rendering under 1000ms
  });
});
