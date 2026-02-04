import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ActiveTasks from '../ActiveTasks';
import { getActiveTasks } from '../../../api/tasks';
import { Task } from '../../../types/task';
import logger from '../../../utils/logger';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../../api/tasks', () => ({
  getActiveTasks: jest.fn()
}));

jest.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: { error: jest.fn() }
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

  it('shows correct priority and status chips for tasks', async () => {
    renderActiveTasks();

    await waitFor(() => {
      expect(screen.getByText('High/Should')).toBeInTheDocument();
      expect(screen.getByText('Normal/Could')).toBeInTheDocument();
      expect(screen.getAllByText('New')).toHaveLength(2);
    });
  });

  it('displays project names and Details button in grid', async () => {
    renderActiveTasks();

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });
    expect(screen.getAllByRole('button', { name: 'Details' }).length).toBeGreaterThanOrEqual(1);
  });

  it('maintains correct grid layout with task cards', async () => {
    renderActiveTasks();

    await waitFor(() => {
      const cards = screen.getAllByText(/Test Task \d/).map(el => el.closest('.MuiCard-root'));
      expect(cards).toHaveLength(2);
    });
  });

  it('navigates to task detail when Details button is clicked', async () => {
    renderActiveTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    const detailsButtons = screen.getAllByRole('button', { name: /Details/i });
    fireEvent.click(detailsButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/tasks/1');
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