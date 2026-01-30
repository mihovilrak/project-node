import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ActiveTasks from '../ActiveTasks';
import { getActiveTasks } from '../../../api/tasks';
import { Task } from '../../../types/task';
import logger from '../../../utils/logger';

// Mock the dayjs module
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  return (date: string) => originalDayjs(date);
});

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../../api/tasks', () => ({
  getActiveTasks: jest.fn()
}));

const mockTasks: Task[] = [
    {
        id: 1,
        name: 'Test Task 1',
        project_id: 1,
        project_name: 'Project A',
        holder_id: 1,
        holder_name: 'John Doe',
        assignee_id: 1,
        assignee_name: 'John Doe',
        parent_id: null,
        parent_name: null,
        description: 'Test description',
        type_id: 1,
        type_name: 'Task',
        status_id: 1,
        status_name: 'New',
        priority_id: 3,
        priority_name: 'High/Should',
        start_date: '2024-01-01T00:00:00Z',
        due_date: '2024-01-15T00:00:00Z',
        end_date: null,
        spent_time: 0,
        progress: 0,
        created_by: 1,
        created_by_name: 'John Doe',
        created_on: '2024-01-01T00:00:00Z',
        estimated_time: 8
    },
    {
        id: 2,
        name: 'Test Task 2',
        project_id: 2,
        project_name: 'Project B',
        holder_id: 1,
        holder_name: 'John Doe',
        assignee_id: 1,
        assignee_name: 'John Doe',
        parent_id: null,
        parent_name: null,
        description: 'Test description 2',
        type_id: 1,
        type_name: 'Task',
        status_id: 1,
        status_name: 'New',
        priority_id: 2,
        priority_name: 'Normal/Could',
        start_date: null,
        due_date: null,
        end_date: null,
        spent_time: 0,
        progress: 0,
        created_by: 1,
        created_by_name: 'John Doe',
        created_on: '2024-01-01T00:00:00Z',
        estimated_time: null
    }
];

const renderActiveTasks = () => {
  return {
    navigate: mockNavigate,
    ...render(
      <BrowserRouter>
        <ActiveTasks />
      </BrowserRouter>
    )
  };
};

describe('ActiveTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getActiveTasks as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('shows loading state initially', () => {
    renderActiveTasks();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays no tasks message when empty', async () => {
    (getActiveTasks as jest.Mock).mockResolvedValueOnce([]);
    renderActiveTasks();

    await waitFor(() => {
      expect(screen.getByText('No active tasks assigned to you.')).toBeInTheDocument();
    });
  });

  it('renders task cards when tasks are loaded', async () => {
    renderActiveTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  it('shows correct priority for tasks', async () => {
    renderActiveTasks();

    await waitFor(() => {
      expect(screen.getByText('Priority: High/Should')).toBeInTheDocument();
      expect(screen.getByText('Priority: Normal/Could')).toBeInTheDocument();
    });
  });

  it('formats dates correctly or shows no date message', async () => {
    renderActiveTasks();

    await waitFor(() => {
      const dueDates = screen.getAllByText(/Due:/);
      expect(dueDates).toHaveLength(2);
      expect(dueDates[0]).toHaveTextContent('Due: Jan 15, 2024');
      expect(dueDates[1]).toHaveTextContent('Due: No due date');
    });
  });

  it('displays project names correctly', async () => {
    renderActiveTasks();

    await waitFor(() => {
      expect(screen.getByText('Project: Project A')).toBeInTheDocument();
      expect(screen.getByText('Project: Project B')).toBeInTheDocument();
    });
  });

  it('maintains correct grid layout', async () => {
    renderActiveTasks();

    await waitFor(() => {
      const cards = screen.getAllByText(/Test Task \d/).map(el => el.closest('.MuiCard-root'));
      expect(cards).toHaveLength(2);
      cards.forEach(card => {
        expect(card).toHaveStyle({ cursor: 'pointer' });
      });
    });
  });

  it('navigates to task detail when card is clicked', async () => {
    renderActiveTasks();

    await waitFor(() => {
      const taskCard = screen.getByText('Test Task 1').closest('.MuiCard-root');
      fireEvent.click(taskCard!);
      expect(mockNavigate).toHaveBeenCalledWith('/tasks/1');
    });
  });

  it('handles API error gracefully', async () => {
    (getActiveTasks as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    renderActiveTasks();

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch active tasks',
        expect.any(Error)
      );
    });
  });
});