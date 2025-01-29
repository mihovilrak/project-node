import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import TaskDetails from '../../../components/Tasks/TaskDetails';
import { TestWrapper } from '../../TestWrapper';
import { Task, TaskStatus } from '../../../types/task';
import { TimeLog } from '../../../types/timeLog';
import { Comment } from '../../../types/comment';
import { TaskFile } from '../../../types/file';
import { TaskWatcher } from '../../../types/watcher';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
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

// Mock task hooks
jest.mock('../../../hooks/task/useTaskCore', () => ({
  useTaskCore: () => ({
    task: mockTask,
    subtasks: mockSubtasks,
    statuses: mockStatuses,
    loading: false,
    error: null,
    handleStatusChange: jest.fn(),
    handleDelete: jest.fn(),
    setSubtasks: jest.fn()
  })
}));

jest.mock('../../../hooks/task/useTaskTimeLogs', () => ({
  useTaskTimeLogs: () => ({
    timeLogs: mockTimeLogs,
    handleTimeLogSubmit: jest.fn(),
    deleteTimeLog: jest.fn(),
    fetchTimeLogs: jest.fn()
  })
}));

jest.mock('../../../hooks/task/useTaskWatchers', () => ({
  useTaskWatchers: () => ({
    watchers: mockWatchers,
    handleAddWatcher: jest.fn(),
    handleRemoveWatcher: jest.fn()
  })
}));

jest.mock('../../../hooks/task/useTaskComments', () => ({
  useTaskComments: () => ({
    comments: mockComments,
    addComment: jest.fn(),
    deleteComment: jest.fn()
  })
}));

jest.mock('../../../hooks/task/useTaskFiles', () => ({
  useTaskFiles: () => ({
    files: mockFiles,
    handleFileUpload: jest.fn(),
    handleFileDelete: jest.fn()
  })
}));

// Mock data
const mockTask: Task = {
  id: 1,
  name: 'Test Task',
  description: 'Test Description',
  project_id: 1,
  project_name: 'Test Project',
  type_id: 1,
  type_name: 'Task',
  type_color: '#E0E0E0',
  type_icon: 'task',
  priority_id: 2,
  priority_name: 'Medium',
  priority_color: '#FFA726',
  status_id: 1,
  status_name: 'To Do',
  parent_id: null,
  parent_name: null,
  holder_id: 1,
  holder_name: 'Test User',
  assignee_id: 2,
  assignee_name: 'Test Assignee',
  start_date: '2024-01-26T00:00:00Z',
  due_date: '2024-02-26T00:00:00Z',
  end_date: null,
  spent_time: 0,
  estimated_time: 8,
  progress: 50,
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2024-01-26T00:00:00Z'
};

const mockSubtasks: Task[] = Array(5).fill(null).map((_, index) => ({
  ...mockTask,
  id: index + 2,
  parent_id: 1,
  parent_name: 'Test Task',
  name: `Subtask ${index + 1}`
}));

const mockStatuses: TaskStatus[] = [
  { 
    id: 1, 
    name: 'To Do', 
    color: '#E0E0E0',
    description: 'Tasks that need to be started',
    active: true,
    created_on: '2024-01-26T00:00:00Z',
    updated_on: null
  },
  { 
    id: 2, 
    name: 'In Progress', 
    color: '#2196F3',
    description: 'Tasks that are being worked on',
    active: true,
    created_on: '2024-01-26T00:00:00Z',
    updated_on: null
  },
  { 
    id: 3, 
    name: 'Done', 
    color: '#4CAF50',
    description: 'Completed tasks',
    active: true,
    created_on: '2024-01-26T00:00:00Z',
    updated_on: null
  }
];

const mockTimeLogs: TimeLog[] = Array(3).fill(null).map((_, index) => ({
  id: index + 1,
  task_id: 1,
  user_id: 1,
  activity_type_id: 1,
  log_date: '2024-01-26',
  spent_time: 60,
  description: `Time log ${index + 1}`,
  created_on: '2024-01-26T00:00:00Z',
  updated_on: null,
  task_name: 'Test Task',
  project_name: 'Test Project',
  user: 'Test User',
  activity_type_name: 'Development',
  activity_type_color: '#2196F3'
}));

const mockComments: Comment[] = Array(5).fill(null).map((_, index) => ({
  id: index + 1,
  task_id: 1,
  user_id: 1,
  comment: `Comment ${index + 1}`,
  active: true,
  created_on: '2024-01-26T00:00:00Z',
  updated_on: null,
  user_name: 'Test User',
  user_avatar: undefined
}));

const mockFiles: TaskFile[] = Array(3).fill(null).map((_, index) => ({
  id: index + 1,
  task_id: 1,
  user_id: 1,
  name: `file${index + 1}.txt`,
  original_name: `file${index + 1}.txt`,
  size: 1024,
  mime_type: 'text/plain',
  url: `/files/${index + 1}/download?taskId=1`,
  uploaded_on: '2024-01-26T00:00:00Z'
}));

const mockWatchers: TaskWatcher[] = Array(3).fill(null).map((_, index) => ({
  task_id: 1,
  user_id: index + 1,
  user_name: `Test User ${index + 1}`,
  role: 'Member'
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
  return actualDuration;
};

// Helper function to measure render performance
const measurePerformance = (Component: React.ComponentType<any>, props = {}) => {
  let duration = 0;

  render(
    <TestWrapper>
      <Profiler id="TaskDetails" onRender={(id, phase, actualDuration) => {
        duration = actualDuration;
      }}>
        <Component {...props} />
      </Profiler>
    </TestWrapper>
  );

  return duration;
};

describe('TaskDetails Performance Tests', () => {
  // Test initial render performance
  test('TaskDetails initial render performance', () => {
    const renderTime = measurePerformance(TaskDetails);
    expect(renderTime).toBeLessThan(200); // Initial render should be reasonably fast
  });

  // Test render performance with many subtasks
  test('TaskDetails render performance with many subtasks', () => {
    // Mock useTaskCore with many subtasks
    jest.spyOn(require('../../../hooks/task/useTaskCore'), 'useTaskCore').mockImplementation(() => ({
      task: mockTask,
      subtasks: Array(50).fill(null).map((_, index) => ({
        ...mockTask,
        id: index + 2,
        parent_id: 1,
        parent_name: 'Test Task',
        name: `Subtask ${index + 1}`
      })),
      statuses: mockStatuses,
      loading: false,
      error: null,
      handleStatusChange: jest.fn(),
      handleDelete: jest.fn(),
      setSubtasks: jest.fn()
    }));

    const renderTime = measurePerformance(TaskDetails);
    expect(renderTime).toBeLessThan(300); // Should still render efficiently with many subtasks
  });

  // Test render performance with many comments
  test('TaskDetails render performance with many comments', () => {
    // Mock useTaskComments with many comments
    jest.spyOn(require('../../../hooks/task/useTaskComments'), 'useTaskComments').mockImplementation(() => ({
      comments: Array(100).fill(null).map((_, index) => ({
        ...mockComments[0],
        id: index + 1,
        comment: `Comment ${index + 1}`
      })),
      addComment: jest.fn(),
      deleteComment: jest.fn()
    }));

    const renderTime = measurePerformance(TaskDetails);
    expect(renderTime).toBeLessThan(300); // Should handle many comments efficiently
  });

  // Test render performance with many files
  test('TaskDetails render performance with many files', () => {
    // Mock useTaskFiles with many files
    jest.spyOn(require('../../../hooks/task/useTaskFiles'), 'useTaskFiles').mockImplementation(() => ({
      files: Array(50).fill(null).map((_, index) => ({
        ...mockFiles[0],
        id: index + 1,
        name: `file${index + 1}.txt`
      })),
      handleFileUpload: jest.fn(),
      handleFileDelete: jest.fn()
    }));

    const renderTime = measurePerformance(TaskDetails);
    expect(renderTime).toBeLessThan(250); // Should handle many files efficiently
  });

  // Test render performance with loading state
  test('TaskDetails render performance in loading state', () => {
    // Mock useTaskCore with loading state
    jest.spyOn(require('../../../hooks/task/useTaskCore'), 'useTaskCore').mockImplementation(() => ({
      task: null,
      subtasks: [],
      statuses: [],
      loading: true,
      error: null,
      handleStatusChange: jest.fn(),
      handleDelete: jest.fn(),
      setSubtasks: jest.fn()
    }));

    const renderTime = measurePerformance(TaskDetails);
    expect(renderTime).toBeLessThan(100); // Loading state should render very quickly
  });
});
