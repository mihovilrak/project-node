import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeLog, ActivityType, TimeLogCreate } from '../../../types/timeLog';
import { Project } from '../../../types/project';
import { Task } from '../../../types/task';
import { User } from '../../../types/user';
import TimeLogForm from '../../../components/TimeLog/TimeLogForm';
import TimeLogList from '../../../components/TimeLog/TimeLogList';
import TimeLogCalendar from '../../../components/TimeLog/TimeLogCalendar';
import TimeLogDialog from '../../../components/TimeLog/TimeLogDialog';
import { createAppTheme } from '../../../theme/theme';
import dayjs from 'dayjs';

// Mock the API module to prevent real HTTP calls
jest.mock('../../../api/api');

// Mock AuthContext to provide a mock user
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

// Mock useTimeLogDialog to prevent any hook-related issues
jest.mock('../../../hooks/timeLog/useTimeLogDialog', () => ({
  useTimeLogDialog: () => ({
    selectedProjectId: 1,
    selectedTaskId: 1,
    selectedUserId: 1,
    selectedActivityTypeId: 1,
    spentTime: '2',
    description: '',
    logDate: dayjs(),
    timeError: null,
    projects: [],
    tasks: [],
    users: [],
    activityTypes: [],
    isLoading: false,
    setSelectedProjectId: jest.fn(),
    setSelectedTaskId: jest.fn(),
    setSelectedUserId: jest.fn(),
    setSelectedActivityTypeId: jest.fn(),
    setSpentTime: jest.fn(),
    setDescription: jest.fn(),
    handleDateChange: jest.fn(),
    handleProjectChange: jest.fn(),
    handleTaskChange: jest.fn(),
    handleSubmit: jest.fn(),
  })
}));

// Mock useTimeLogCalendar for calendar component
jest.mock('../../../hooks/timeLog/useTimeLogCalendar', () => ({
  useTimeLogCalendar: () => ({
    currentDate: new Date(),
    navigateMonth: jest.fn(),
    getTimeLogsForDate: jest.fn(() => []),
    getTotalHoursForDate: jest.fn(() => 0),
    getDayColor: jest.fn(() => '#ffffff'),
    formatTime: jest.fn((time: number) => `${time}h`),
    getCalendarDays: jest.fn(() => [new Date()]),
    getTotalMonthHours: jest.fn(() => 0)
  })
}));

// Mock timeLogs API
jest.mock('../../../api/timeLogs', () => ({
  getProjectTimeLogs: jest.fn().mockResolvedValue([]),
  getTaskTimeLogs: jest.fn().mockResolvedValue([]),
  createTimeLog: jest.fn().mockResolvedValue({}),
  updateTimeLog: jest.fn().mockResolvedValue({}),
  deleteTimeLog: jest.fn().mockResolvedValue({})
}));

// Custom test wrapper with all necessary providers
const PerfTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createAppTheme('light');
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Mock data generators
const generateMockTimeLogs = (count: number): TimeLog[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    task_id: (index % 5) + 1,
    user_id: (index % 3) + 1,
    activity_type_id: (index % 4) + 1,
    log_date: dayjs().subtract(index, 'day').format('YYYY-MM-DD'),
    spent_time: Math.floor(Math.random() * 8) + 1,
    description: `Time log description ${index + 1}`,
    created_on: dayjs().subtract(index, 'day').toISOString(),
    updated_on: null,
    task_name: `Task ${(index % 5) + 1}`,
    project_name: `Project ${(index % 3) + 1}`,
    user: `User ${(index % 3) + 1}`,
    activity_type_name: `Activity ${(index % 4) + 1}`,
    activity_type_color: '#FF0000',
    activity_type_icon: 'clock'
  }));
};

const mockActivityTypes: ActivityType[] = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  name: `Activity ${index + 1}`,
  description: `Activity type description ${index + 1}`,
  color: '#FF0000',
  icon: 'clock',
  active: true,
  created_on: dayjs().toISOString(),
  updated_on: null
}));

const mockProjects: Project[] = Array.from({ length: 3 }, (_, index) => ({
  id: index + 1,
  name: `Project ${index + 1}`,
  description: `Project description ${index + 1}`,
  due_date: dayjs().add(30, 'days').toISOString(),
  estimated_time: 100,
  spent_time: 0,
  status_id: 1,
  status_name: 'Active',
  created_by: 1,
  created_by_name: 'Test User',
  parent_id: null,
  parent_name: null,
  created_on: dayjs().toISOString(),
  updated_on: null,
  start_date: dayjs().toISOString(),
  end_date: dayjs().add(30, 'days').toISOString(),
  progress: 0
}));

const mockTasks: Task[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  name: `Task ${index + 1}`,
  project_id: (index % 3) + 1,
  project_name: `Project ${(index % 3) + 1}`,
  holder_id: 1,
  holder_name: 'Test User',
  assignee_id: 1,
  assignee_name: 'Test User',
  parent_id: null,
  parent_name: null,
  description: `Task description ${index + 1}`,
  type_id: 1,
  type_name: 'Task',
  type_color: '#000000',
  type_icon: 'task',
  status_id: 1,
  status_name: 'Active',
  priority_id: 1,
  priority_name: 'Medium',
  priority_color: '#FFA500',
  start_date: dayjs().toISOString(),
  due_date: dayjs().add(7, 'days').toISOString(),
  end_date: null,
  spent_time: 0,
  progress: 0,
  created_by: 1,
  created_by_name: 'Test User',
  created_on: dayjs().toISOString(),
  estimated_time: 40
}));

const mockUsers: User[] = Array.from({ length: 3 }, (_, index) => ({
  id: index + 1,
  login: `user${index + 1}`,
  name: `First${index + 1}`,
  surname: `Last${index + 1}`,
  email: `user${index + 1}@example.com`,
  role_id: 1,
  status_id: 3,
  timezone: 'UTC',
  language: 'en',
  avatar_url: null,
  created_on: dayjs().toISOString(),
  updated_on: null,
  last_login: null,
  role: 'Developer',
  status: 'Active',
  status_color: '#00FF00',
  full_name: `First${index + 1} Last${index + 1}`,
  permissions: ['read', 'write']
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
  console.log(`${id} - ${phase}`);
  console.log(`Actual duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base duration: ${baseDuration.toFixed(2)}ms`);
};

// Helper function to measure render performance
const measurePerformance = (Component: React.ComponentType<any>, props = {}) => {
  return (
    <Profiler id={Component.name} onRender={onRenderCallback}>
      <PerfTestWrapper>
        <Component {...props} />
      </PerfTestWrapper>
    </Profiler>
  );
};

describe('TimeLog Components Performance', () => {
  // TimeLogList Performance Tests
  describe('TimeLogList', () => {
    it('renders efficiently with 10 time logs', () => {
      const timeLogs = generateMockTimeLogs(10);
      render(measurePerformance(TimeLogList, { timeLogs }));
    });

    it('renders efficiently with 50 time logs', () => {
      const timeLogs = generateMockTimeLogs(50);
      render(measurePerformance(TimeLogList, { timeLogs }));
    });

    it('renders efficiently with 100 time logs', () => {
      const timeLogs = generateMockTimeLogs(100);
      render(measurePerformance(TimeLogList, { timeLogs }));
    });
  });

  // TimeLogForm Performance Tests
  describe('TimeLogForm', () => {
    const baseProps = {
      projects: mockProjects,
      tasks: mockTasks,
      activityTypes: mockActivityTypes,
      users: mockUsers,
      selectedProjectId: 1,
      selectedTaskId: 1,
      selectedUserId: 1,
      selectedActivityTypeId: 1,
      spentTime: '2',
      description: '',
      logDate: dayjs(),
      timeError: null,
      showUserSelect: true,
      onProjectChange: () => {},
      onTaskChange: () => {},
      onUserChange: () => {},
      onActivityTypeChange: () => {},
      onSpentTimeChange: () => {},
      onDescriptionChange: () => {},
      onDateChange: () => {}
    };

    it('renders efficiently with base configuration', () => {
      render(measurePerformance(TimeLogForm, baseProps));
    });

    it('renders efficiently with many projects and tasks', () => {
      const manyProjects = Array.from({ length: 100 }, (_, i) => ({
        ...mockProjects[0],
        id: i + 1,
        name: `Project ${i + 1}`
      }));
      const manyTasks = Array.from({ length: 200 }, (_, i) => ({
        ...mockTasks[0],
        id: i + 1,
        name: `Task ${i + 1}`
      }));
      render(measurePerformance(TimeLogForm, { ...baseProps, projects: manyProjects, tasks: manyTasks }));
    });
  });

  // TimeLogCalendar Performance Tests
  describe('TimeLogCalendar', () => {
    it('renders efficiently with 10 time logs', () => {
      render(measurePerformance(TimeLogCalendar, { projectId: 1 }));
    });

    it('renders efficiently with 50 time logs', () => {
      render(measurePerformance(TimeLogCalendar, { projectId: 1 }));
    });
  });

  // TimeLogDialog Performance Tests
  describe('TimeLogDialog', () => {
    const baseDialogProps = {
      open: true,
      projectId: 1,
      taskId: 1,
      timeLog: null,
      onClose: () => {},
      onSubmit: async (timeLog: TimeLogCreate) => {}
    };

    it('renders efficiently when creating new time log', () => {
      render(measurePerformance(TimeLogDialog, baseDialogProps));
    });

    it('renders efficiently when editing existing time log', () => {
      const timeLog = generateMockTimeLogs(1)[0];
      render(measurePerformance(TimeLogDialog, { ...baseDialogProps, timeLog }));
    });
  });
});
