import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../TestWrapper';
import { api } from '../../api/api';
import { TimeLog } from '../../types/timeLog';
import { Task } from '../../types/task';
import { Project } from '../../types/project';
import { User } from '../../types/user';
import TaskTimeLogging from '../../components/Tasks/TaskTimeLogging';
import TimeLogDialog from '../../components/TimeLog/TimeLogDialog';
import React from 'react';

// Mock the API calls
jest.mock('../../api/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Time Log Integration Tests', () => {
  const mockUser: User = {
    id: 1,
    login: 'testuser',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    role_id: 1,
    status_id: 1,
    created_on: '2024-01-01',
    updated_on: null,
    last_login: null
  };

  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'Test project description',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'Active',
    start_date: '2024-01-01',
    due_date: '2024-02-01',
    created_on: '2024-01-01',
    created_by: 1,
    created_by_name: 'Test User',
    estimated_time: 50,
    spent_time: 0,
    progress: 0
  };

  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    project_id: 1,
    project_name: 'Test Project',
    holder_id: 1,
    holder_name: 'Test User',
    assignee_id: 1,
    assignee_name: 'Test User',
    parent_id: null,
    parent_name: null,
    description: 'Test task description',
    type_id: 1,
    type_name: 'Task',
    priority_id: 1,
    priority_name: 'Medium',
    status_id: 1,
    status_name: 'In Progress',
    start_date: '2024-01-01',
    due_date: '2024-02-01',
    estimated_time: null,
    progress: 0,
    created_on: '2024-01-01',
    created_by: 1,
    end_date: null,
    created_by_name: 'Test User',
    spent_time: 0
  };

  const mockTimeLog: TimeLog = {
    id: 1,
    task_id: 1,
    user_id: 1,
    log_date: '2024-01-01',
    spent_time: 1,
    description: 'Test time log',
    activity_type_id: 1,
    created_on: '2024-01-01',
    updated_on: null,
    task_name: 'Test Task',
    project_name: 'Test Project',
    activity_type_name: 'Development'
  };

  test('should create a new time log', async () => {
    // Mock API responses
    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('/projects')) {
        return Promise.resolve({ data: [mockProject] });
      } else if (url.includes('/tasks')) {
        return Promise.resolve({ data: [mockTask] });
      } else if (url.includes('/time-logs')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Not found'));
    });

    mockedApi.post.mockResolvedValue({ data: mockTimeLog });

    const onSubmit = jest.fn();
    const onClose = jest.fn();

    const { container } = render(
      <TestWrapper>
        <TimeLogDialog
          open={true}
          projectId={mockProject.id}
          taskId={mockTask.id}
          timeLog={null}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/description/i), 'Test time log');
    await userEvent.type(screen.getByLabelText(/spent time/i), '1');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/time-logs', expect.any(Object));
      expect(onSubmit).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('should edit an existing time log', async () => {
    // Mock API responses
    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('/projects')) {
        return Promise.resolve({ data: [mockProject] });
      } else if (url.includes('/tasks')) {
        return Promise.resolve({ data: [mockTask] });
      } else if (url.includes('/time-logs')) {
        return Promise.resolve({ data: [mockTimeLog] });
      }
      return Promise.reject(new Error('Not found'));
    });

    mockedApi.put.mockResolvedValue({ data: { ...mockTimeLog, spent_time: 2 } });

    const onSubmit = jest.fn();
    const onClose = jest.fn();

    const { container } = render(
      <TestWrapper>
        <TimeLogDialog
          open={true}
          projectId={mockProject.id}
          taskId={mockTask.id}
          timeLog={mockTimeLog}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );

    // Update spent time
    const spentTimeInput = screen.getByLabelText(/spent time/i);
    await userEvent.clear(spentTimeInput);
    await userEvent.type(spentTimeInput, '2');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockedApi.put).toHaveBeenCalledWith(`/time-logs/${mockTimeLog.id}`, expect.any(Object));
      expect(onSubmit).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('should delete a time log', async () => {
    mockedApi.get.mockResolvedValue({ data: [mockTimeLog] });
    mockedApi.delete.mockResolvedValue({ data: {} });

    const onDelete = jest.fn();
    const onEdit = jest.fn();
    const onSubmit = jest.fn();
    const onClose = jest.fn();

    const { container } = render(
      <TestWrapper>
        <TaskTimeLogging
          taskId={mockTask.id}
          projectId={mockProject.id}
          timeLogs={[mockTimeLog]}
          timeLogDialogOpen={false}
          selectedTimeLog={null}
          onTimeLogSubmit={onSubmit}
          onTimeLogDelete={onDelete}
          onTimeLogEdit={onEdit}
          onTimeLogDialogClose={onClose}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalled();
    });

    // Find and click delete button for the time log
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith(`/time-logs/${mockTimeLog.id}`);
      expect(onDelete).toHaveBeenCalledWith(mockTimeLog.id);
    });
  });

  test('should display time logs correctly', async () => {
    render(
      <TestWrapper>
        <TaskTimeLogging
          taskId={mockTask.id}
          projectId={mockProject.id}
          timeLogs={[mockTimeLog]}
          timeLogDialogOpen={false}
          selectedTimeLog={null}
          onTimeLogSubmit={jest.fn()}
          onTimeLogDelete={jest.fn()}
          onTimeLogEdit={jest.fn()}
          onTimeLogDialogClose={jest.fn()}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('1h')).toBeInTheDocument();
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Test time log')).toBeInTheDocument();
    });
  });

  test('should filter time logs by date range', async () => {
    mockedApi.get.mockResolvedValue({ data: [mockTimeLog] });

    const onDelete = jest.fn();
    const onEdit = jest.fn();
    const onSubmit = jest.fn();
    const onClose = jest.fn();

    const { container } = render(
      <TestWrapper>
        <TaskTimeLogging
          taskId={mockTask.id}
          projectId={mockProject.id}
          timeLogs={[mockTimeLog]}
          timeLogDialogOpen={false}
          selectedTimeLog={null}
          onTimeLogSubmit={onSubmit}
          onTimeLogDelete={onDelete}
          onTimeLogEdit={onEdit}
          onTimeLogDialogClose={onClose}
        />
      </TestWrapper>
    );

    // Filter by date range
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await userEvent.type(startDateInput, '2024-01-01');
    await userEvent.type(endDateInput, '2024-01-31');

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('/time-logs'),
        expect.objectContaining({
          params: expect.objectContaining({
            start_date: '2024-01-01',
            end_date: '2024-01-31'
          })
        })
      );
    });
  });
});
