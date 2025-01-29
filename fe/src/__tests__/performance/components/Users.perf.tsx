import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Profiler } from 'react';
import Users from '../../../components/Users/Users';
import { TestWrapper } from '../../TestWrapper';
import { User } from '../../../types/user';

// Mock user data
const mockUsers: User[] = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  login: `user${index + 1}`,
  name: `John${index + 1}`,
  surname: `Doe${index + 1}`,
  email: `john.doe${index + 1}@example.com`,
  role_id: 1,
  status_id: 1,
  timezone: 'UTC',
  language: 'en',
  avatar_url: null,
  created_on: '2024-01-26T00:00:00Z',
  updated_on: null,
  last_login: null,
  role: 'User',
  status: 'Active',
  status_color: '#00FF00',
  full_name: `John${index + 1} Doe${index + 1}`,
  permissions: ['read', 'write']
}));

// Mock API calls
jest.mock('../../../api/users', () => ({
  getUsers: jest.fn().mockResolvedValue(mockUsers),
  deleteUser: jest.fn().mockResolvedValue(true)
}));

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

// Helper function to measure render performance
const measurePerformance = (Component: React.ComponentType): number => {
  let duration = 0;

  render(
    <TestWrapper>
      <Profiler id="Users" onRender={(id, phase, actualDuration) => {
        duration = actualDuration;
      }}>
        <Component />
      </Profiler>
    </TestWrapper>
  );

  return duration;
};

describe('Users Component Performance Tests', () => {
  test('Users component initial render performance', () => {
    const renderTime = measurePerformance(Users);
    expect(renderTime).toBeLessThan(100); // Initial render should be under 100ms
  });

  test('Users component filtering performance', async () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <Profiler id="UsersFiltering" onRender={onRenderCallback}>
          <Users />
        </Profiler>
      </TestWrapper>
    );

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0));

    const searchInput = getByPlaceholderText('Search...');
    const startTime = performance.now();

    // Simulate search input
    fireEvent.change(searchInput, { target: { value: 'John1' } });

    const endTime = performance.now();
    const filterDuration = endTime - startTime;

    expect(filterDuration).toBeLessThan(50); // Filtering should be under 50ms
  });

  test('Users component sorting performance', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <Profiler id="UsersSorting" onRender={onRenderCallback}>
          <Users />
        </Profiler>
      </TestWrapper>
    );

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0));

    const sortSelect = getByRole('button', { name: /a-z/i });
    const startTime = performance.now();

    // Change sort order
    fireEvent.mouseDown(sortSelect);
    fireEvent.click(getByRole('option', { name: /z-a/i }));

    const endTime = performance.now();
    const sortDuration = endTime - startTime;

    expect(sortDuration).toBeLessThan(50); // Sorting should be under 50ms
  });

  test('Users component deletion performance', async () => {
    const { getAllByRole } = render(
      <TestWrapper>
        <Profiler id="UsersDeletion" onRender={onRenderCallback}>
          <Users />
        </Profiler>
      </TestWrapper>
    );

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0));

    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    const deleteButtons = getAllByRole('button', { name: /delete/i });
    const startTime = performance.now();

    // Delete first user
    fireEvent.click(deleteButtons[0]);

    const endTime = performance.now();
    const deleteDuration = endTime - startTime;

    expect(deleteDuration).toBeLessThan(50); // Deletion should be under 50ms

    // Restore window.confirm
    window.confirm = originalConfirm;
  });
});
