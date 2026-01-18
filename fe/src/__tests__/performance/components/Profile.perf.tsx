import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Profile from '../../../components/Profile/Profile';
import ProfileHeader from '../../../components/Profile/ProfileHeader';
import ProfileStats from '../../../components/Profile/ProfileStats';
import ProfileTaskList from '../../../components/Profile/ProfileTaskList';
import ProfileProjectList from '../../../components/Profile/ProfileProjectList';
import { ProfileData } from '../../../types/profile';
import { createAppTheme } from '../../../theme/theme';

// Mock the API module to prevent real HTTP calls
jest.mock('../../../api/api');

// Mock AuthContext to prevent session checks
jest.mock('../../../context/AuthContext', () => ({
  ...jest.requireActual('../../../context/AuthContext'),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    currentUser: { id: 1, name: 'Test User' },
    hasPermission: () => true,
    permissionsLoading: false,
    userPermissions: [{ permission: 'Admin' }]
  })
}));

// Mock useProfileData hook
jest.mock('../../../hooks/profile/useProfileData', () => ({
  useProfileData: () => ({
    profile: {
      id: 1,
      login: 'testuser',
      name: 'Test User',
      surname: 'Test',
      email: 'test@example.com',
      role_id: 1,
      status_id: 1,
      avatar_url: null,
      created_on: '2024-01-26T00:00:00Z',
      updated_on: null,
      last_login: null,
      total_tasks: 10,
      completed_tasks: 5,
      active_projects: 3,
      total_hours: 120
    },
    recentTasks: [],
    recentProjects: [],
    loading: false,
    error: null,
    editDialogOpen: false,
    passwordDialogOpen: false,
    updateSuccess: false,
    setEditDialogOpen: jest.fn(),
    setPasswordDialogOpen: jest.fn(),
    setUpdateSuccess: jest.fn(),
    handleProfileUpdate: jest.fn(),
    handleTaskClick: jest.fn(),
    getTypedProfile: () => ({
      id: 1,
      login: 'testuser',
      name: 'Test User',
      surname: 'Test',
      email: 'test@example.com',
      role_id: 1,
      status_id: 1,
      avatar_url: null,
      created_on: '2024-01-26T00:00:00Z',
      updated_on: null,
      last_login: null,
      total_tasks: 10,
      completed_tasks: 5,
      active_projects: 3,
      total_hours: 120
    }),
    getProfileStats: () => ({
      totalTasks: 10,
      completedTasks: 5,
      activeProjects: 3,
      totalHours: 120
    })
  })
}));

// Custom test wrapper
const PerfTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createAppTheme('light');
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

const mockProfileData: ProfileData = {
  id: 1,
  login: 'testuser',
  name: 'Test User',
  surname: 'Test',
  email: 'test@example.com',
  role_id: 1,
  status_id: 1,
  avatar_url: null,
  created_on: '2024-01-26T00:00:00Z',
  updated_on: null,
  last_login: null,
  total_tasks: 10,
  completed_tasks: 5,
  active_projects: 3,
  total_hours: 120
};

const mockProjects = [
  {
    id: 1,
    name: 'Project 1',
    description: 'Test project 1',
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
  },
  {
    id: 2,
    name: 'Project 2',
    description: 'Test project 2',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'Active',
    start_date: '2024-01-26T00:00:00Z',
    due_date: '2024-02-26T00:00:00Z',
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2024-01-26T00:00:00Z',
    estimated_time: 120,
    spent_time: 40,
    progress: 33
  }
];

const mockTasks = [
  {
    id: 1,
    name: 'Task 1',
    project_id: 1,
    project_name: 'Project 1',
    holder_id: 1,
    holder_name: 'Test User',
    assignee_id: 1,
    assignee_name: 'Test User',
    parent_id: null,
    parent_name: null,
    description: 'Test task 1',
    type_id: 1,
    type_name: 'Feature',
    type_color: '#4CAF50',
    type_icon: 'star',
    status_id: 2,
    status_name: 'In Progress',
    priority_id: 2,
    priority_name: 'Medium',
    priority_color: '#FFA726',
    start_date: '2024-01-26T00:00:00Z',
    due_date: '2024-02-26T00:00:00Z',
    end_date: null
  },
  {
    id: 2,
    name: 'Task 2',
    project_id: 1,
    project_name: 'Project 1',
    holder_id: 1,
    holder_name: 'Test User',
    assignee_id: 1,
    assignee_name: 'Test User',
    parent_id: null,
    parent_name: null,
    description: 'Test task 2',
    type_id: 1,
    type_name: 'Bug',
    type_color: '#F44336',
    type_icon: 'bug_report',
    status_id: 3,
    status_name: 'Completed',
    priority_id: 3,
    priority_name: 'High',
    priority_color: '#F44336',
    start_date: '2024-01-26T00:00:00Z',
    due_date: '2024-02-26T00:00:00Z',
    end_date: '2024-01-30T00:00:00Z'
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
  console.log(`Component: ${id}`);
  console.log(`Phase: ${phase}`);
  console.log(`Actual Duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base Duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Commit Time: ${commitTime}ms`);
  console.log('-------------------');
};

describe('Profile Components Performance Tests', () => {
  // Helper function to measure render performance
  const measurePerformance = (Component: React.ComponentType<any>, props = {}) => {
    const start = performance.now();

    render(
      <PerfTestWrapper>
        <Profiler id={Component.name} onRender={onRenderCallback}>
          <Component {...props} />
        </Profiler>
      </PerfTestWrapper>
    );

    const end = performance.now();
    return end - start;
  };

  // Profile Header Tests
  test('ProfileHeader component initial render performance', () => {
    const renderTime = measurePerformance(ProfileHeader, { user: mockProfileData });
    expect(renderTime).toBeLessThan(500); // Should render under 500ms
  });

  // Profile Stats Tests
  test('ProfileStats component initial render performance', () => {
    const stats = {
      totalTasks: mockProfileData.total_tasks,
      completedTasks: mockProfileData.completed_tasks,
      activeProjects: mockProfileData.active_projects,
      totalHours: mockProfileData.total_hours
    };
    const renderTime = measurePerformance(ProfileStats, { stats, loading: false });
    expect(renderTime).toBeLessThan(500); // Should render under 500ms
  });

  // Profile Task List Tests
  test('ProfileTaskList component initial render performance', () => {
    const renderTime = measurePerformance(ProfileTaskList, {
      tasks: mockTasks,
      loading: false,
      onTaskClick: () => {}
    });
    expect(renderTime).toBeLessThan(500); // Should render under 500ms
  });

  // Profile Project List Tests
  test('ProfileProjectList component initial render performance', () => {
    const renderTime = measurePerformance(ProfileProjectList, {
      projects: mockProjects,
      loading: false
    });
    expect(renderTime).toBeLessThan(500); // Should render under 500ms
  });

  // Main Profile Component Tests
  test('Profile component initial render performance', () => {
    const renderTime = measurePerformance(Profile);
    expect(renderTime).toBeLessThan(1000); // Should render under 1000ms
  });

  // Loading State Tests
  test('Components render performance in loading state', () => {
    const statsRenderTime = measurePerformance(ProfileStats, { stats: null, loading: true });
    expect(statsRenderTime).toBeLessThan(500); // Should render under 500ms

    const taskListRenderTime = measurePerformance(ProfileTaskList, {
      tasks: [],
      loading: true,
      onTaskClick: () => {}
    });
    expect(taskListRenderTime).toBeLessThan(500);

    const projectListRenderTime = measurePerformance(ProfileProjectList, {
      projects: [],
      loading: true
    });
    expect(projectListRenderTime).toBeLessThan(500);
  });
});
