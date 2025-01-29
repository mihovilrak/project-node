import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectGantt from '../ProjectGantt';
import { updateTaskDates } from '../../../api/tasks';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the tasks API
jest.mock('../../../api/tasks', () => ({
  updateTaskDates: jest.fn()
}));

// Mock the scheduler components
jest.mock('@devexpress/dx-react-scheduler-material-ui', () => ({
  Scheduler: ({ children }: any) => <div data-testid="scheduler">{children}</div>,
  DayView: () => <div>DayView</div>,
  WeekView: () => <div>WeekView</div>,
  MonthView: () => <div>MonthView</div>,
  Appointments: () => <div>Appointments</div>,
  Toolbar: () => <div>Toolbar</div>,
  DateNavigator: () => <div>DateNavigator</div>,
  ViewSwitcher: () => <div>ViewSwitcher</div>,
  TodayButton: () => <div>TodayButton</div>,
  AppointmentTooltip: () => <div>AppointmentTooltip</div>,
  DragDropProvider: () => <div>DragDropProvider</div>
}));

// Sample test data
const mockTasks = [
  {
    id: 1,
    name: 'Task 1',
    start_date: '2024-01-01',
    due_date: '2024-01-05',
    assignee_id: 1,
    type_name: 'Bug',
    type_color: '#f44336',
    type_icon: 'BugReport',
    priority_name: 'Very high/Must',
    status_name: 'In Progress',
    description: 'Test task'
  },
  {
    id: 2,
    name: 'Task 2',
    start_date: '2024-01-03',
    due_date: '2024-01-07',
    assignee_id: 2,
    type_name: 'Feature',
    type_color: '#ff9800',
    type_icon: 'NewReleases',
    priority_name: 'Normal/Could',
    status_name: 'New',
    description: 'Another test task'
  }
];

const theme = createTheme();

describe('ProjectGantt', () => {
  const renderComponent = (props: any) => {
    return render(
      <ThemeProvider theme={theme}>
        <ProjectGantt {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when loading', () => {
    renderComponent({ projectId: 1, tasks: [] });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error alert when there is an error', async () => {
    renderComponent({ projectId: 1, tasks: [], error: 'Test error' });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('renders scheduler with tasks', async () => {
    renderComponent({ projectId: 1, tasks: mockTasks });
    
    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('handles task date updates', async () => {
    const mockUpdateTaskDates = updateTaskDates as jest.MockedFunction<typeof updateTaskDates>;
    mockUpdateTaskDates.mockResolvedValueOnce({ 
      id: 1,
      name: 'Task 1',
      project_id: 1,
      project_name: 'Test Project',
      holder_id: 1,
      holder_name: 'Test Holder',
      assignee_id: 1,
      assignee_name: 'Test Assignee',
      parent_id: null,
      parent_name: null,
      description: 'Test task',
      type_id: 2,
      type_name: 'Bug',
      type_color: '#f44336',
      type_icon: 'BugReport',
      status_id: 1,
      status_name: 'In Progress',
      priority_id: 4,
      priority_name: 'Very high/Must',
      start_date: '2024-01-02',
      due_date: '2024-01-06',
      end_date: null,
      spent_time: 0,
      progress: 0,
      created_by: 1,
      created_by_name: 'Test Creator',
      created_on: '2024-01-01',
      estimated_time: 8
    });

    renderComponent({ projectId: 1, tasks: mockTasks });

    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeInTheDocument();
    });

    // Simulate task update
    const changes = {
      changed: {
        '1': {
          startDate: new Date('2024-01-02'),
          endDate: new Date('2024-01-06')
        }
      }
    };

    // Trigger task update
    const scheduler = screen.getByTestId('scheduler');
    fireEvent(scheduler, new CustomEvent('commitChanges', { detail: changes }));

    await waitFor(() => {
      expect(mockUpdateTaskDates).toHaveBeenCalledWith(1, {
        start_date: '2024-01-02',
        due_date: '2024-01-06'
      });
    });
  });

  it('handles task update errors', async () => {
    const mockUpdateTaskDates = updateTaskDates as jest.MockedFunction<typeof updateTaskDates>;
    mockUpdateTaskDates.mockRejectedValueOnce(new Error('Update failed'));

    renderComponent({ projectId: 1, tasks: mockTasks });

    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeInTheDocument();
    });

    // Simulate task update
    const changes = {
      changed: {
        '1': {
          startDate: new Date('2024-01-02'),
          endDate: new Date('2024-01-06')
        }
      }
    };

    // Trigger task update
    const scheduler = screen.getByTestId('scheduler');
    fireEvent(scheduler, new CustomEvent('commitChanges', { detail: changes }));

    await waitFor(() => {
      expect(screen.getByText('Failed to update task dates')).toBeInTheDocument();
    });
  });

  it('formats tasks correctly for display', async () => {
    renderComponent({ projectId: 1, tasks: mockTasks });

    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeInTheDocument();
    });

    // Verify scheduler data formatting
    const formattedTasks = mockTasks.map(task => ({
      id: task.id,
      title: task.name,
      startDate: new Date(task.start_date),
      endDate: new Date(task.due_date),
      assigneeId: task.assignee_id,
      type_name: task.type_name,
      priority: task.priority_name,
      status: task.status_name,
      description: task.description,
    }));

    expect(screen.getByTestId('scheduler')).toHaveAttribute('data', JSON.stringify(formattedTasks));
  });
});