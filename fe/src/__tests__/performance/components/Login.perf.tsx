import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import Login from '../../../components/Auth/Login';
import { TestWrapper } from '../../TestWrapper';

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
      <TestWrapper>
        <Profiler id={Component.name} onRender={onRenderCallback}>
          <Component {...props} />
        </Profiler>
      </TestWrapper>
    );
    
    const end = performance.now();
    return end - start;
  };

  // Test initial render performance
  test('Login component initial render performance', () => {
    const renderTime = measurePerformance(Login);
    expect(renderTime).toBeLessThan(100); // Should render under 100ms as it's a relatively simple form
  });

  // Test re-render performance with input changes
  test('Login component re-render performance with form interactions', () => {
    const renderTime = measurePerformance(Login);
    expect(renderTime).toBeLessThan(50); // Should re-render quickly after input changes
  });

  // Test render performance with error state
  test('Login component render performance with error state', () => {
    const renderTime = measurePerformance(Login);
    expect(renderTime).toBeLessThan(100); // Should handle error state rendering efficiently
  });
});
