import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import UserDetails from '../../../components/Users/UserDetails';
import { UserDetailsState } from '../../../types/user';
import { createAppTheme } from '../../../theme/theme';

// Mock the API module to prevent real HTTP calls
jest.mock('../../../api/api');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

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

// Mock users API
jest.mock('../../../api/users', () => ({
  getUserById: jest.fn().mockResolvedValue({
    id: 1,
    login: 'testuser',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    role_id: 1,
    status_id: 1,
    avatar_url: null,
    created_on: '2023-01-01T12:00:00Z',
    updated_on: '2023-01-02T12:00:00Z',
    last_login: '2023-01-03T12:00:00Z',
    role_name: 'Admin',
    status_name: 'Active'
  })
}));

// Custom test wrapper
const PerfTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createAppTheme('light');
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
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

describe('UserDetails Component Performance Tests', () => {
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

  // Test initial render performance (loading state)
  test('UserDetails component initial render performance', () => {
    const renderTime = measurePerformance(UserDetails);
    expect(renderTime).toBeLessThan(500); // Should render under 500ms
  });

  // Test render performance with user data
  test('UserDetails render performance with user data', () => {
    const mockUser: UserDetailsState = {
      user: {
        id: 1,
        login: 'john.doe',
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        role_id: 1,
        status_id: 1,
        role_name: 'Admin',
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        last_login: new Date().toISOString(),
        avatar_url: null
      },
      loading: false,
      error: null
    };

    const renderTime = measurePerformance(UserDetails, { initialState: mockUser });
    expect(renderTime).toBeLessThan(500); // Should render under 500ms
  });

  // Test render performance with error state
  test('UserDetails render performance with error state', () => {
    const mockError: UserDetailsState = {
      user: null,
      loading: false,
      error: 'Failed to fetch user details'
    };

    const renderTime = measurePerformance(UserDetails, { initialState: mockError });
    expect(renderTime).toBeLessThan(500); // Should render under 500ms
  });
});
