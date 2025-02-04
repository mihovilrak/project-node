import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import UserDetails from '../../../components/Users/UserDetails';
import { TestWrapper } from '../../TestWrapper';
import { UserDetailsState } from '../../../types/user';

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
      <TestWrapper>
        <Profiler id={Component.name} onRender={onRenderCallback}>
          <Component {...props} />
        </Profiler>
      </TestWrapper>
    );
    
    const end = performance.now();
    return end - start;
  };

  // Test initial render performance (loading state)
  test('UserDetails component initial render performance', () => {
    const renderTime = measurePerformance(UserDetails);
    expect(renderTime).toBeLessThan(100); // Initial render with loading state should be quick
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
    expect(renderTime).toBeLessThan(150); // Render with data should still be performant
  });

  // Test render performance with error state
  test('UserDetails render performance with error state', () => {
    const mockError: UserDetailsState = {
      user: null,
      loading: false,
      error: 'Failed to fetch user details'
    };

    const renderTime = measurePerformance(UserDetails, { initialState: mockError });
    expect(renderTime).toBeLessThan(100); // Error state should render quickly
  });
});
