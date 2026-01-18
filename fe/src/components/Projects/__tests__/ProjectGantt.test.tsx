import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectGantt from '../ProjectGantt';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Task } from '../../../types/task';

// Suppress console errors from tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
console.error = jest.fn();
console.warn = jest.fn();

// Mock DevExpress components
jest.mock('@devexpress/dx-react-scheduler', () => ({
  ViewState: ({ children }: any) => <div data-testid="view-state">{children}</div>,
  EditingState: ({ children }: any) => <div data-testid="editing-state">{children}</div>,
  IntegratedEditing: ({ children }: any) => <div data-testid="integrated-editing">{children}</div>
}));

jest.mock('@devexpress/dx-react-scheduler-material-ui', () => ({
  Scheduler: ({ children }: any) => <div data-testid="scheduler">{children}</div>,
  DayView: () => <div data-testid="day-view">DayView</div>,
  WeekView: () => <div data-testid="week-view">WeekView</div>,
  MonthView: () => <div data-testid="month-view">MonthView</div>,
  Appointments: () => <div data-testid="appointments">Appointments</div>,
  Toolbar: () => <div data-testid="toolbar">Toolbar</div>,
  DateNavigator: () => <div data-testid="date-navigator">DateNavigator</div>,
  ViewSwitcher: () => <div data-testid="view-switcher">ViewSwitcher</div>,
  TodayButton: () => <div data-testid="today-button">TodayButton</div>,
  AppointmentTooltip: () => <div data-testid="appointment-tooltip">AppointmentTooltip</div>,
  DragDropProvider: () => <div data-testid="drag-drop-provider">DragDropProvider</div>
}));

// Mock API
jest.mock('../../../api/tasks', () => ({
  updateTaskDates: jest.fn()
}));

// Mock custom hook
jest.mock('../../../hooks/project/useProjectGantt', () => ({
  useProjectGantt: jest.fn()
}));

// Sample task data for tests
const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Task 1',
    project_id: 1,
    project_name: 'Test Project',
    parent_id: null,
    parent_name: null,
    description: 'Test task',
    type_id: 1,
    type_name: 'Bug',
    type_color: '#f44336',
    type_icon: 'BugReport',
    status_id: 1,
    status_name: 'In Progress',
    priority_id: 1,
    priority_name: 'High',
    start_date: '2024-01-01',
    due_date: '2024-01-05',
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2024-01-01',
    estimated_time: null,
    assignee_id: 1
  },
  {
    id: 2,
    name: 'Task 2',
    project_id: 1,
    project_name: 'Test Project',
    parent_id: null,
    parent_name: null,
    description: 'Another test task',
    type_id: 2,
    type_name: 'Feature',
    type_color: '#ff9800',
    type_icon: 'NewReleases',
    status_id: 1,
    status_name: 'New',
    priority_id: 2,
    priority_name: 'Normal',
    start_date: '2024-01-03',
    due_date: '2024-01-07',
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2024-01-01',
    estimated_time: null,
    assignee_id: 2
  }
];

describe('ProjectGantt component', () => {
  // Helper function to render component with theme
  const renderWithTheme = (props: any) => {
    const theme = createTheme();
    return render(
      <ThemeProvider theme={theme}>
        <ProjectGantt {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default hook mock implementation
    const { useProjectGantt } = require('../../../hooks/project/useProjectGantt');
    useProjectGantt.mockImplementation((tasks: Task[] = []) => {
      return {
        tasks: tasks.length > 0 ? tasks.map(task => ({
          id: task.id,
          title: task.name,
          startDate: new Date(),
          endDate: new Date(),
          type_name: task.type_name,
          priority: task.priority_name,
          status: task.status_name,
          description: task.description
        })) : [],
        loading: tasks.length === 0,
        error: null,
        currentDate: new Date(),
        currentViewName: 'Month',
        setCurrentDate: jest.fn(),
        setCurrentViewName: jest.fn(),
        setError: jest.fn(),
        renderAppointment: jest.fn(),
        renderAppointmentContent: jest.fn(),
        renderTooltipContent: jest.fn()
      };
    });
  });

  // TEST 1: Loading state when no tasks
  it('shows loading spinner when tasks array is empty', () => {
    renderWithTheme({ projectId: 1, tasks: [] });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // TEST 2: Error display
  it('shows error message when error occurs', () => {
    const { useProjectGantt } = require('../../../hooks/project/useProjectGantt');
    useProjectGantt.mockReturnValueOnce({
      tasks: [],
      loading: false,
      error: 'Test error message',
      currentDate: new Date(),
      currentViewName: 'Month',
      setCurrentDate: jest.fn(),
      setCurrentViewName: jest.fn(),
      setError: jest.fn(),
      renderAppointment: jest.fn(),
      renderAppointmentContent: jest.fn(),
      renderTooltipContent: jest.fn()
    });

    renderWithTheme({ projectId: 1, tasks: [] });
    const alertElements = document.querySelectorAll('[role="alert"]');
    expect(alertElements.length).toBeGreaterThan(0);
  });

  // TEST 3: Rendering with tasks
  it('renders scheduler when tasks are provided', () => {
    renderWithTheme({ projectId: 1, tasks: mockTasks });
    expect(screen.getByTestId('scheduler')).toBeInTheDocument();
  });

  // TEST 4: Displaying necessary components
  it('displays all required scheduler components', () => {
    renderWithTheme({ projectId: 1, tasks: mockTasks });
    expect(screen.getByTestId('day-view')).toBeInTheDocument();
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.getByTestId('appointments')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  // TEST 5: Navigation components
  it('renders navigation components', () => {
    renderWithTheme({ projectId: 1, tasks: mockTasks });
    expect(screen.getByTestId('date-navigator')).toBeInTheDocument();
    expect(screen.getByTestId('view-switcher')).toBeInTheDocument();
  });

  // TEST 6: Additional UI elements
  it('renders appointment tooltip and drag-drop provider', () => {
    renderWithTheme({ projectId: 1, tasks: mockTasks });
    expect(screen.getByTestId('appointment-tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('drag-drop-provider')).toBeInTheDocument();
  });

  // Restore console methods
  afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });
});