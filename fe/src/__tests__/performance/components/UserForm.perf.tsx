import React from 'react';
import { render, screen } from '@testing-library/react';
import { Profiler } from 'react';
import UserForm from '../../../components/Users/UserForm';
import { TestWrapper } from '../../TestWrapper';
import userEvent from '@testing-library/user-event';

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
  test('UserForm component initial render performance', () => {
    const renderTime = measurePerformance(UserForm);
    expect(renderTime).toBeLessThan(200); // Form has more fields, allowing more time
  });

  // Test form input performance
  test('UserForm input field interactions performance', async () => {
    render(
      <TestWrapper>
        <Profiler id="UserForm-Input" onRender={onRenderCallback}>
          <UserForm />
        </Profiler>
      </TestWrapper>
    );

    const start = performance.now();
    
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, 'John Doe');
    
    const end = performance.now();
    const inputTime = end - start;
    
    expect(inputTime).toBeLessThan(100); // Input operations should be responsive
  });

  // Test form submission performance
  test('UserForm submission performance', async () => {
    render(
      <TestWrapper>
        <Profiler id="UserForm-Submit" onRender={onRenderCallback}>
          <UserForm />
        </Profiler>
      </TestWrapper>
    );

    const start = performance.now();
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    const end = performance.now();
    const submitTime = end - start;
    
    expect(submitTime).toBeLessThan(150); // Form submission should be quick
  });
});
