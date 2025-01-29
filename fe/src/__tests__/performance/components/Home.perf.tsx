import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import Home from '../../../components/Home/Home';
import ActiveTasks from '../../../components/Home/ActiveTasks';
import { TestWrapper } from '../../TestWrapper';
import { Task } from '../../../types/task';

// Mock data
const mockTasks: Task[] = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `Test Task ${index + 1}`,
  project_id: 1,
  project_name: 'Test Project',
  holder_id: 1,
  holder_name: 'Test User',
  assignee_id: 1,
  assignee_name: 'Test User',
  parent_id: null,
  parent_name: null,
  description: `Description for task ${index + 1}`,
  type_id: 1,
  type_name: 'Task',
  type_color: '#000000',
  type_icon: 'task',
  status_id: 1,
  status_name: 'Active',
  priority_id: 1,
  priority_name: 'Medium',
  priority_color: '#FFA500',
  start_date: null,
  due_date: new Date(Date.now() + 86400000).toISOString(),
  end_date: null,
  spent_time: 0,
  progress: 0,
  created_by: 1,
  created_by_name: 'Test User',
  created_on: new Date().toISOString(),
  estimated_time: null
}));

// Mock system settings
const mockSettings = {
  settings: {
    welcome_message: '<h1>Welcome to the Project Management App</h1><p>This is a test welcome message.</p>'
  }
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
  console.log(`${id} - ${phase}:`);
  console.log(`Actual duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Commit time: ${commitTime}ms`);
};

// Helper function to measure render performance
const measurePerformance = (Component: React.ComponentType<any>, props = {}) => {
  const { unmount } = render(
    <TestWrapper>
      <Profiler id="test" onRender={onRenderCallback}>
        <Component {...props} />
      </Profiler>
    </TestWrapper>
  );

  return unmount;
};

// Mock API calls
jest.mock('../../../api/tasks', () => ({
  getActiveTasks: jest.fn().mockResolvedValue([])
}));

// Mock hooks
jest.mock('../../../hooks/setting/useSystemSettings', () => ({
  useSystemSettings: jest.fn().mockReturnValue({ state: mockSettings })
}));

describe('Home Components Performance Tests', () => {
  describe('Home Component Performance Tests', () => {
    test('Home initial render performance with welcome message', () => {
      const unmount = measurePerformance(Home);
      unmount();
    });

    test('Home initial render performance without welcome message', () => {
      const settingsWithoutMessage = { settings: { welcome_message: '' } };
      jest.mock('../../../hooks/setting/useSystemSettings', () => ({
        useSystemSettings: jest.fn().mockReturnValue({ state: settingsWithoutMessage })
      }));
      
      const unmount = measurePerformance(Home);
      unmount();
    });
  });

  describe('ActiveTasks Component Performance Tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('ActiveTasks initial render performance with empty task list', () => {
      const unmount = measurePerformance(ActiveTasks);
      unmount();
    });

    test('ActiveTasks initial render performance with 10 tasks', () => {
      jest.mock('../../../api/tasks', () => ({
        getActiveTasks: jest.fn().mockResolvedValue(mockTasks)
      }));

      const unmount = measurePerformance(ActiveTasks);
      unmount();
    });

    test('ActiveTasks initial render performance with loading state', () => {
      jest.mock('../../../api/tasks', () => ({
        getActiveTasks: jest.fn().mockImplementation(() => new Promise(() => {}))
      }));

      const unmount = measurePerformance(ActiveTasks);
      unmount();
    });
  });
});
