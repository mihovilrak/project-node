import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Profiler } from 'react';
import Settings from '../../../components/Settings/Settings';
import { TestWrapper } from '../../TestWrapper';
import { User } from '../../../types/user';
import { Role } from '../../../types/role';
import { TaskType, ActivityType, Permission } from '../../../types/setting';

// Mock user data
const mockUsers: User[] = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  login: `user${index + 1}`,
  name: `First${index + 1}`,
  surname: `Last${index + 1}`,
  email: `user${index + 1}@example.com`,
  role_id: 1,
  status_id: 1,
  timezone: 'UTC',
  language: 'en',
  avatar_url: null,
  created_on: '2024-01-26T00:00:00Z',
  updated_on: null,
  last_login: null,
  role: 'Admin',
  status: 'Active',
  status_color: '#00FF00',
  full_name: `First${index + 1} Last${index + 1}`,
  permissions: ['Admin']
}));

// Mock roles data based on actual SQL data
const mockPermissions: Permission[] = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Create projects' },
  { id: 3, name: 'Edit projects' },
  { id: 4, name: 'Delete projects' },
  { id: 5, name: 'Create tasks' },
  { id: 6, name: 'Edit tasks' },
  { id: 7, name: 'Delete tasks' },
  { id: 8, name: 'Log time' },
  { id: 9, name: 'Edit log' },
  { id: 10, name: 'Delete log' },
  { id: 11, name: 'Delete files' }
];

const mockRoles: Role[] = [
  {
    id: 1,
    name: 'Admin',
    description: 'Administrator role',
    active: true,
    created_on: '2024-01-26T00:00:00Z',
    permissions: mockPermissions
  },
  {
    id: 2,
    name: 'User',
    description: 'Regular user role',
    active: true,
    created_on: '2024-01-26T00:00:00Z',
    permissions: [mockPermissions[4], mockPermissions[5], mockPermissions[7]]
  }
];

// Mock task types data
const mockTaskTypes: TaskType[] = [
  {
    id: 1,
    name: 'Task',
    color: '#2196f3',
    icon: 'TaskAlt',
    description: 'A task is a unit of work that needs to be completed.',
    active: true
  },
  {
    id: 2,
    name: 'Bug',
    color: '#f44336',
    icon: 'BugReport',
    description: 'A bug is an error or issue in a program.',
    active: true
  },
  {
    id: 3,
    name: 'Work Package',
    color: '#4caf50',
    icon: 'WorkOutline',
    description: 'A work package is a collection of tasks.',
    active: true
  }
];

// Mock activity types
const mockActivityTypes: ActivityType[] = [
  {
    id: 1,
    name: 'Development',
    color: '#2196f3',
    icon: 'Code',
    description: 'Development work',
    active: true
  },
  {
    id: 2,
    name: 'Meeting',
    color: '#9c27b0',
    icon: 'Group',
    description: 'Team meetings and discussions',
    active: true
  }
];

// Mock API responses
jest.mock('../../../api/users', () => ({
  getUsers: jest.fn().mockResolvedValue(mockUsers)
}));

jest.mock('../../../api/roles', () => ({
  getRoles: jest.fn().mockResolvedValue(mockRoles)
}));

jest.mock('../../../api/taskTypes', () => ({
  getTaskTypes: jest.fn().mockResolvedValue(mockTaskTypes)
}));

jest.mock('../../../api/activityTypes', () => ({
  getActivityTypes: jest.fn().mockResolvedValue(mockActivityTypes)
}));

// Mock AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    permissionsLoading: false,
    user: mockUsers[0],
    permissions: ['Admin']
  })
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
  console.log(`${id} ${phase} render:`, {
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  });
  return actualDuration;
};

// Helper function to measure render performance
const measurePerformance = (Component: React.ComponentType): number => {
  let duration = 0;

  render(
    <TestWrapper>
      <Profiler id="Settings" onRender={(id, phase, actualDuration) => {
        duration = onRenderCallback(id, phase, actualDuration, 0, 0, 0);
      }}>
        <Component />
      </Profiler>
    </TestWrapper>
  );

  return duration;
};

describe('Settings Component Performance Tests', () => {
  test('Settings component initial render performance', () => {
    const renderTime = measurePerformance(Settings);
    expect(renderTime).toBeLessThan(100); // Initial render should be under 100ms
  });

  test('Settings component tab switching performance', () => {
    const { getByText } = render(
      <TestWrapper>
        <Profiler id="Settings-TabSwitch" onRender={onRenderCallback}>
          <Settings />
        </Profiler>
      </TestWrapper>
    );

    // Measure tab switching performance
    ['Users', 'Types & Roles', 'System'].forEach(tabName => {
      const startTime = performance.now();
      const tab = getByText(tabName);
      fireEvent.click(tab);
      const endTime = performance.now();
      const switchTime = endTime - startTime;
      
      expect(switchTime).toBeLessThan(50); // Tab switching should be under 50ms
    });
  });

  test('Settings component with large data sets', () => {
    // Override mock data with larger datasets
    const largeUserSet = Array.from({ length: 100 }, (_, i) => ({
      ...mockUsers[0],
      id: i + 1,
      login: `user${i + 1}`,
      name: `First${i + 1}`,
      surname: `Last${i + 1}`,
      email: `user${i + 1}@example.com`,
      full_name: `First${i + 1} Last${i + 1}`
    }));

    jest.spyOn(require('../../../api/users'), 'getUsers')
      .mockResolvedValueOnce(largeUserSet);

    const renderTime = measurePerformance(Settings);
    expect(renderTime).toBeLessThan(200); // Render with large dataset should be under 200ms
  });

  test('User table sorting and filtering performance', () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <Profiler id="Settings-UserTable" onRender={onRenderCallback}>
          <Settings />
        </Profiler>
      </TestWrapper>
    );

    // Test search filter performance
    const searchInput = getByPlaceholderText('Search...');
    const startSearchTime = performance.now();
    fireEvent.change(searchInput, { target: { value: 'user1' } });
    const endSearchTime = performance.now();
    expect(endSearchTime - startSearchTime).toBeLessThan(50); // Search should be under 50ms

    // Test sorting performance
    const nameHeader = getByText('Name');
    const startSortTime = performance.now();
    fireEvent.click(nameHeader);
    const endSortTime = performance.now();
    expect(endSortTime - startSortTime).toBeLessThan(50); // Sorting should be under 50ms
  });

  test('Types & Roles tab performance', () => {
    const { getByText, getAllByRole } = render(
      <TestWrapper>
        <Profiler id="Settings-TypesAndRoles" onRender={onRenderCallback}>
          <Settings />
        </Profiler>
      </TestWrapper>
    );

    // Switch to Types & Roles tab
    fireEvent.click(getByText('Types & Roles'));

    // Test task type dialog performance
    const addButtons = getAllByRole('button', { name: /add/i });
    const startDialogTime = performance.now();
    fireEvent.click(addButtons[0]); // Click first Add button
    const endDialogTime = performance.now();
    expect(endDialogTime - startDialogTime).toBeLessThan(50); // Dialog open should be under 50ms
  });

  test('System settings form performance', () => {
    const { getByText, getByLabelText } = render(
      <TestWrapper>
        <Profiler id="Settings-SystemSettings" onRender={onRenderCallback}>
          <Settings />
        </Profiler>
      </TestWrapper>
    );

    // Switch to System tab
    fireEvent.click(getByText('System'));

    // Test form input performance
    const appNameInput = getByLabelText('Application Name');
    const startInputTime = performance.now();
    fireEvent.change(appNameInput, { target: { value: 'New App Name' } });
    const endInputTime = performance.now();
    expect(endInputTime - startInputTime).toBeLessThan(50); // Input change should be under 50ms
  });
});
