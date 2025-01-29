import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Calendar from '../../components/Calendar/Calendar';
import TaskForm from '../../components/Tasks/TaskForm';
import { Task, UseTaskFormProps } from '../../types/task';
import { TimeLog } from '../../types/timeLog';
import { CalendarView } from '../../types/calendar';
import { useCalendar } from '../../hooks/calendar/useCalendar';
import { useTaskForm } from '../../hooks/task/useTaskForm';
import { BrowserRouter } from 'react-router-dom';

const mockTask: Task = {
  id: 1,
  name: 'Test Task',
  description: 'Test Description',
  project_id: 1,
  project_name: 'Test Project',
  holder_id: 1,
  holder_name: 'Test Holder',
  assignee_id: 1,
  assignee_name: 'Test Assignee',
  parent_id: null,
  parent_name: null,
  type_id: 1,
  type_name: 'Task',
  status_id: 1,
  status_name: 'Open',
  priority_id: 1,
  priority_name: 'High',
  start_date: '2024-01-15',
  due_date: '2024-01-20',
  end_date: null,
  spent_time: 0,
  progress: 0,
  created_by: 1,
  created_by_name: 'Test Creator',
  created_on: '2024-01-15',
  estimated_time: 8
};

const mockTimeLog: TimeLog = {
  id: 1,
  task_id: 1,
  user_id: 1,
  activity_type_id: 1,
  log_date: '2024-01-15',
  spent_time: 8,
  description: 'Test Time Log',
  created_on: '2024-01-15T09:00:00',
  updated_on: null
};

// Mock the hooks
jest.mock('../../hooks/calendar/useCalendar');
jest.mock('../../hooks/task/useTaskForm', () => ({
  useTaskForm: ({ taskId, projectId, projectIdFromQuery, parentTaskId, currentUserId }: UseTaskFormProps) => ({
    formData: {
      name: '',
      description: '',
      project_id: projectIdFromQuery ? Number(projectIdFromQuery) : (projectId ? Number(projectId) : null),
      type_id: 1,
      priority_id: 1,
      status_id: 1,
      holder_id: currentUserId || null,
      assignee_id: null,
      start_date: null,
      due_date: null,
      estimated_time: null
    },
    projects: [],
    projectMembers: [],
    projectTasks: [],
    statuses: [],
    priorities: [],
    isEditing: false,
    isLoading: false,
    handleChange: jest.fn(),
    handleSubmit: jest.fn().mockImplementation((e: React.FormEvent) => {
      e.preventDefault();
      return Promise.resolve(mockTask);
    })
  })
}));
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { id: 1, name: 'Test User' }
  })
}));

describe('Calendar Integration Workflow', () => {
  const mockDate = new Date('2024-01-15');

  const setupMocks = () => {
    (useCalendar as jest.Mock).mockReturnValue({
      tasks: [mockTask],
      timeLogs: [mockTimeLog],
      loading: false,
      view: 'month' as CalendarView,
      selectedDate: mockDate,
      handleDateChange: jest.fn(),
      handleViewChange: jest.fn(),
      handleTaskClick: jest.fn(),
      handleTimeLogClick: jest.fn()
    });
  };

  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Task Scheduling and Event Creation', () => {
    test('should create a new task with deadline and verify it appears in calendar', async () => {
      const user = userEvent.setup();
      const { getByTestId, getByText, getByLabelText } = render(
        <BrowserRouter>
          <TaskForm />
          <Calendar />
        </BrowserRouter>
      );

      // Fill out task form
      await user.type(getByLabelText('Task Name'), 'New Integration Test Task');
      await user.type(getByLabelText('Description'), 'Test Description');
      await user.type(getByLabelText('Due Date'), '2024-01-20');
      
      // Submit form
      const submitButton = getByText('Create');
      await user.click(submitButton);

      // Create a mock form event
      const form = document.createElement('form');
      const mockFormEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
      }) as unknown as React.FormEvent<HTMLFormElement>;
      Object.defineProperty(mockFormEvent, 'target', { value: form });
      Object.defineProperty(mockFormEvent, 'currentTarget', { value: form });

      // Verify task creation was called
      await waitFor(() => {
        const taskForm = useTaskForm({ 
          taskId: undefined, 
          projectId: undefined, 
          projectIdFromQuery: null, 
          parentTaskId: null, 
          currentUserId: 1 
        });
        expect(taskForm.handleSubmit).toHaveBeenCalledWith(mockFormEvent);
      });

      // Verify task appears in calendar
      const calendarDay = getByTestId('calendar-day-2024-01-20');
      expect(within(calendarDay).getByText('New Integration Test Task')).toBeInTheDocument();
    });
  });

  describe('Calendar View Switching', () => {
    test('should switch between different calendar views and maintain task visibility', async () => {
      const user = userEvent.setup();
      const { getByRole, getByTestId } = render(<Calendar />);

      // Test switching to day view
      await user.click(getByRole('button', { name: 'Day' }));
      expect(useCalendar().handleViewChange).toHaveBeenCalledWith('day');
      expect(getByTestId('day-view')).toBeInTheDocument();

      // Test switching to week view
      await user.click(getByRole('button', { name: 'Week' }));
      expect(useCalendar().handleViewChange).toHaveBeenCalledWith('week');
      expect(getByTestId('week-view')).toBeInTheDocument();

      // Test switching to month view
      await user.click(getByRole('button', { name: 'Month' }));
      expect(useCalendar().handleViewChange).toHaveBeenCalledWith('month');
      expect(getByTestId('month-view')).toBeInTheDocument();
    });
  });

  describe('Date Range Navigation', () => {
    test('should navigate between different date ranges and update task display', async () => {
      const user = userEvent.setup();
      const { getByRole, getByTestId } = render(<Calendar />);

      // Navigate to next month
      await user.click(getByRole('button', { name: 'Next' }));
      expect(useCalendar().handleDateChange).toHaveBeenCalled();

      // Navigate to previous month
      await user.click(getByRole('button', { name: 'Previous' }));
      expect(useCalendar().handleDateChange).toHaveBeenCalled();

      // Navigate to today
      await user.click(getByRole('button', { name: 'Today' }));
      expect(useCalendar().handleDateChange).toHaveBeenCalledWith(expect.any(Date));
    });
  });

  describe('Task Deadline Visualization', () => {
    test('should properly display tasks with deadlines in different views', async () => {
      const { getByTestId, getAllByText } = render(<Calendar />);

      // Verify task appears in month view
      expect(getAllByText(mockTask.name)).toHaveLength(1);

      // Verify task deadline styling
      const taskElement = getByTestId(`task-${mockTask.id}`);
      expect(taskElement).toHaveClass('deadline');

      // Verify overdue task styling if applicable
      const overdueTask = {
        ...mockTask,
        id: 2,
        due_date: '2024-01-10', // Past due date
        name: 'Overdue Task'
      };
      
      (useCalendar as jest.Mock).mockReturnValue({
        ...useCalendar(),
        tasks: [mockTask, overdueTask]
      });

      // Re-render with overdue task
      render(<Calendar />);
      const overdueTaskElement = getByTestId(`task-2`);
      expect(overdueTaskElement).toHaveClass('overdue');
    });
  });
});
