import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { Profiler } from 'react';
import ProjectForm from '../../../components/Projects/ProjectForm';
import { TestWrapper } from '../../TestWrapper';
import { Project } from '../../../types/project';
import { User } from '../../../types/user';

// Mock project data
const mockProject: Project = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  parent_id: null,
  parent_name: null,
  status_id: 1,
  status_name: 'Active',
  start_date: '2024-01-26T00:00:00Z',
  due_date: '2024-02-26T00:00:00Z',
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2024-01-26T00:00:00Z',
  estimated_time: 80,
  spent_time: 20,
  progress: 25
};

// Mock users data
const mockUsers: User[] = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  login: `user${index}`,
  name: `User ${index}`,
  surname: `Surname ${index}`,
  email: `user${index}@example.com`,
  role_id: 1,
  status_id: 1,
  timezone: 'UTC',
  language: 'en',
  avatar_url: null,
  created_on: '2024-01-26T00:00:00Z',
  updated_on: null,
  last_login: null
}));

// Mock API functions
jest.mock('../../../api/projects', () => ({
  createProject: jest.fn().mockResolvedValue({ id: 999 }),
  addProjectMember: jest.fn().mockResolvedValue({ success: true }),
  getProjects: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../../api/users', () => ({
  getUsers: jest.fn().mockResolvedValue([]),
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
  // Log or assert performance metrics
  console.log(`${id} - ${phase} - Actual Duration: ${actualDuration}ms`);
  expect(actualDuration).toBeLessThan(1500); // Expect renders to be under 1500ms (accounting for test environment)
};

// Helper function to measure render performance
const measurePerformance = (Component: React.ComponentType<any>, props = {}): number => {
  let duration = 0;
  render(
    <Profiler id="test" onRender={(id, phase, actualDuration) => {
      duration = actualDuration;
    }}>
      <TestWrapper>
        <Component {...props} />
      </TestWrapper>
    </Profiler>
  );
  return duration;
};

describe('ProjectForm Component Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initially within performance threshold', () => {
    const renderDuration = measurePerformance(ProjectForm, {
      project: mockProject,
      onSubmit: jest.fn(),
      onClose: jest.fn()
    });
    expect(renderDuration).toBeLessThan(500);
  });

  it('handles form interactions efficiently', async () => {
    const { getByLabelText, getByRole } = render(
      <TestWrapper>
        <Profiler id="ProjectForm" onRender={onRenderCallback}>
          <ProjectForm
            project={mockProject}
            onSubmit={jest.fn()}
            onClose={jest.fn()}
          />
        </Profiler>
      </TestWrapper>
    );

    // Measure input performance
    await act(async () => {
      const startTime = performance.now();

      fireEvent.change(getByLabelText(/name/i), {
        target: { value: 'Updated Project Name' }
      });

      fireEvent.change(getByLabelText(/description/i), {
        target: { value: 'Updated Project Description' }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(2500); // Form interactions may take longer in test environment
    });
  });

  it('maintains performance with large datasets', async () => {
    // Create large mock datasets
    const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
      ...mockUsers[0],
      id: i + 1,
      name: `User ${i + 1}`,
    }));

    const largeProjectList = Array.from({ length: 1000 }, (_, i) => ({
      ...mockProject,
      id: i + 1,
      name: `Project ${i + 1}`,
    }));

    // Update mock implementations
    require('../../../api/users').getUsers.mockResolvedValue(largeUserList);
    require('../../../api/projects').getProjects.mockResolvedValue(largeProjectList);

    const startTime = performance.now();

    const { container } = render(
      <TestWrapper>
        <Profiler id="ProjectFormLarge" onRender={onRenderCallback}>
          <ProjectForm onSubmit={jest.fn()} onClose={jest.fn()} />
        </Profiler>
      </TestWrapper>
    );

    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(3000);
    expect(container).toBeInTheDocument();
  });

  it('handles rapid state updates efficiently', async () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <Profiler id="ProjectFormRapid" onRender={onRenderCallback}>
          <ProjectForm onSubmit={jest.fn()} onClose={jest.fn()} />
        </Profiler>
      </TestWrapper>
    );

    await act(async () => {
      const startTime = performance.now();

      // Perform 10 rapid updates
      for (let i = 0; i < 10; i++) {
        fireEvent.change(getByLabelText(/name/i), {
          target: { value: `Test Project ${i}` }
        });
      }

      const updateTime = performance.now() - startTime;
      expect(updateTime).toBeLessThan(7000); // Rapid updates (10 iterations) may take longer in test environment
    });
  });
});
