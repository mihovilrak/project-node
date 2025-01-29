import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import TaskForm from '../../../components/Tasks/TaskForm';
import { TestWrapper } from '../../TestWrapper';
import { Task, TaskStatus, TaskPriority, TaskType } from '../../../types/task';
import { ProjectMember } from '../../../types/project';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useLocation: () => ({
    search: '?projectId=1'
  }),
  useNavigate: () => jest.fn()
}));

// Mock the auth context
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      id: 1,
      name: 'Test User'
    }
  })
}));

// Mock the useTaskForm hook
jest.mock('../../../hooks/task/useTaskForm', () => ({
  useTaskForm: () => ({
    formData: {
      name: '',
      description: '',
      project_id: 1,
      type_id: 1,
      priority_id: 2,
      status_id: 1,
      parent_id: null,
      holder_id: 1,
      assignee_id: null,
      start_date: '2024-01-26T00:00:00Z',
      due_date: null,
      estimated_time: 0,
      progress: 0,
      created_by: 1,
      tags: []
    },
    projects: [],
    projectMembers: mockProjectMembers,
    projectTasks: [],
    statuses: mockStatuses,
    priorities: mockPriorities,
    isEditing: false,
    isLoading: false,
    handleChange: jest.fn(),
    handleSubmit: jest.fn()
  })
}));

const mockStatuses: TaskStatus[] = [
  {
    id: 1,
    name: 'To Do',
    color: '#E5E5E5',
    description: 'Task is pending',
    active: true,
    created_on: '2024-01-26T00:00:00Z',
    updated_on: null
  },
  {
    id: 2,
    name: 'In Progress',
    color: '#FFD700',
    description: 'Task is in progress',
    active: true,
    created_on: '2024-01-26T00:00:00Z',
    updated_on: null
  }
];

const mockPriorities: TaskPriority[] = [
  {
    id: 1,
    name: 'Low',
    color: '#00FF00',
    description: 'Low priority',
    active: true,
    created_on: '2024-01-26T00:00:00Z',
    updated_on: null
  },
  {
    id: 2,
    name: 'High',
    color: '#FF0000',
    description: 'High priority',
    active: true,
    created_on: '2024-01-26T00:00:00Z',
    updated_on: null
  }
];

const mockProjectMembers: ProjectMember[] = [
  {
    project_id: 1,
    user_id: 1,
    role_id: 1,
    created_on: '2024-01-26T00:00:00Z',
    name: 'John Doe',
    surname: 'Doe',
    role: 'Admin'
  }
];

// Performance measurement callback
const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  return actualDuration;
};

describe('TaskForm Performance Tests', () => {
  // Helper function to measure render performance
  const measurePerformance = (Component: React.ComponentType<any>, props = {}) => {
    let renderTime = 0;
    render(
      <TestWrapper>
        <Profiler id="TaskFormTest" onRender={(id, phase, actualDuration) => {
          renderTime = actualDuration;
        }}>
          <Component {...props} />
        </Profiler>
      </TestWrapper>
    );
    return renderTime;
  };

  // Test initial render performance of empty form
  test('TaskForm empty form initial render performance', () => {
    const renderTime = measurePerformance(TaskForm);
    expect(renderTime).toBeLessThan(100); // Empty form should render quickly
  });

  // Test form render performance with many project members
  test('TaskForm with many project members render performance', () => {
    const manyProjectMembers = Array.from({ length: 100 }, (_, index) => ({
      project_id: 1,
      user_id: index + 1,
      role_id: 1,
      created_on: '2024-01-26T00:00:00Z',
      name: `User ${index + 1}`,
      surname: `User ${index + 1}`,
      role: 'User'
    }));

    // Update the mock to use many project members
    jest.mock('../../../hooks/task/useTaskForm', () => ({
      useTaskForm: () => ({
        ...jest.requireActual('../../../hooks/task/useTaskForm')(),
        projectMembers: manyProjectMembers
      })
    }));

    const renderTime = measurePerformance(TaskForm);
    expect(renderTime).toBeLessThan(250); // Form with many members should still render efficiently
  });
});
