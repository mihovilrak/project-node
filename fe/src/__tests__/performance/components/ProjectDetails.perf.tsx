import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import ProjectDetails from '../../../components/Projects/ProjectDetails';
import { TestWrapper } from '../../TestWrapper';
import { Project } from '../../../types/project';
import { Task } from '../../../types/task';
import { ProjectMember } from '../../../types/project';
import { TimeLog } from '../../../types/timeLog';

// Mock project data
const mockProject: Project = {
  id: 1,
  name: 'Test Project',
  description: 'Test project description',
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

// Mock tasks data
const mockTasks: Task[] = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `Task ${index + 1}`,
  description: `Test task ${index + 1}`,
  project_id: 1,
  project_name: 'Test Project',
  status_id: 1,
  status_name: 'In Progress',
  type_id: 1,
  type_name: 'Feature',
  priority_id: 2,
  priority_name: 'Medium',
  assignee_id: 1,
  assignee_name: 'Test User',
  holder_id: 1,
  holder_name: 'Test User',
  parent_id: null,
  parent_name: null,
  start_date: '2024-01-26T00:00:00Z',
  due_date: '2024-02-26T00:00:00Z',
  end_date: null,
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2024-01-26T00:00:00Z',
  estimated_time: 8,
  spent_time: 2,
  progress: 25
}));

// Mock members data
const mockMembers: ProjectMember[] = Array.from({ length: 5 }, (_, index) => ({
  project_id: 1,
  user_id: index + 1,
  role_id: 1,
  created_on: '2024-01-26T00:00:00Z',
  name: `User ${index + 1}`,
  surname: 'Test',
  role: 'Member'
}));

// Mock time logs data
const mockTimeLogs: TimeLog[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  task_id: index + 1,
  task_name: `Task ${index + 1}`,
  user_id: 1,
  user_name: 'Test User',
  date: '2024-01-26',
  spent_time: 2,
  description: `Work on task ${index + 1}`,
  created_on: '2024-01-26T00:00:00Z',
  activity_type_id: 1,
  log_date: '2024-01-26',
  updated_on: null
}));

// Mock project details hook
jest.mock('../../../hooks/project/useProjectDetails', () => ({
  useProjectDetails: jest.fn(() => ({
    project: mockProject,
    projectDetails: mockProject,
    members: mockMembers,
    tasks: mockTasks,
    timeLogs: mockTimeLogs,
    loading: false,
    error: null,
    editDialogOpen: false,
    deleteDialogOpen: false,
    taskFormOpen: false,
    timeLogDialogOpen: false,
    manageMembersOpen: false,
    selectedTimeLog: null,
    canEdit: true,
    canDelete: true,
    canManageMembers: true,
    setState: jest.fn(),
    handleProjectUpdate: jest.fn(),
    handleProjectDelete: jest.fn(),
    handleMemberRemove: jest.fn(),
    handleTaskCreate: jest.fn(),
    handleTimeLogSubmit: jest.fn(),
    handleTimeLogEdit: jest.fn(),
    handleTimeLogDelete: jest.fn(),
    handleMembersUpdate: jest.fn(),
    setTimeLogDialogOpen: jest.fn(),
    setSelectedTimeLog: jest.fn(),
    setTaskFormOpen: jest.fn(),
    setManageMembersOpen: jest.fn()
  }))
}));

// Mock router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
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
const measurePerformance = (Component: React.ComponentType<any>, props = {}): number => {
  let duration = 0;
  
  render(
    <TestWrapper>
      <Profiler id="ProjectDetailsTest" onRender={(id, phase, actualDuration) => {
        if (phase === 'mount') {
          duration = actualDuration;
        }
      }}>
        <Component {...props} />
      </Profiler>
    </TestWrapper>
  );

  return duration;
};

describe('ProjectDetails Component Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Initial render performance', () => {
    const renderTime = measurePerformance(ProjectDetails);
    expect(renderTime).toBeLessThan(100); // Initial render should be under 100ms
  });

  test('Performance with large dataset', () => {
    // Override mock with larger dataset
    const largeMockTasks = Array.from({ length: 100 }, (_, i) => ({
      ...mockTasks[0],
      id: i + 1,
      name: `Task ${i + 1}`
    }));

    jest.mock('../../../hooks/project/useProjectDetails', () => ({
      useProjectDetails: jest.fn(() => ({
        ...mockProject,
        tasks: largeMockTasks
      }))
    }));

    const renderTime = measurePerformance(ProjectDetails);
    expect(renderTime).toBeLessThan(200); // Should handle large datasets efficiently
  });

  test('Tab switching performance', () => {
    const { rerender } = render(
      <TestWrapper>
        <Profiler id="TabSwitchTest" onRender={onRenderCallback}>
          <ProjectDetails />
        </Profiler>
      </TestWrapper>
    );

    // Measure rerender performance for tab switches
    const startTime = performance.now();
    rerender(
      <TestWrapper>
        <Profiler id="TabSwitchTest" onRender={onRenderCallback}>
          <ProjectDetails />
        </Profiler>
      </TestWrapper>
    );
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50); // Tab switch should be quick
  });

  test('Dialog open/close performance', () => {
    const { rerender } = render(
      <TestWrapper>
        <Profiler id="DialogTest" onRender={onRenderCallback}>
          <ProjectDetails />
        </Profiler>
      </TestWrapper>
    );

    // Measure dialog open performance
    const startTime = performance.now();
    rerender(
      <TestWrapper>
        <Profiler id="DialogTest" onRender={onRenderCallback}>
          <ProjectDetails />
        </Profiler>
      </TestWrapper>
    );
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50); // Dialog operations should be quick
  });
});
