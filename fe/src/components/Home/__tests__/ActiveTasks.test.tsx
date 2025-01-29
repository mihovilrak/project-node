import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router-dom';
import ActiveTasks from '../ActiveTasks';
import { getActiveTasks } from '../../../api/tasks';
import { Task } from '../../../types/task';

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

// Additional test cases for ActiveTasks component:

it('shows correct priority for tasks', async () => {
    (getActiveTasks as jest.Mock).mockResolvedValueOnce(mockTasks);
    renderActiveTasks();

    await waitFor(() => {
        expect(screen.getByText('Priority: High/Should')).toBeInTheDocument();
        expect(screen.getByText('Priority: Normal/Could')).toBeInTheDocument();
    });
});

it('formats dates correctly or shows no date message', async () => {
    (getActiveTasks as jest.Mock).mockResolvedValueOnce(mockTasks);
    renderActiveTasks();

    await waitFor(() => {
        const dueDates = screen.getAllByText(/Due:/);
        expect(dueDates).toHaveLength(2);
        expect(dueDates[0]).toHaveTextContent('Due: Jan 15, 2024');
        expect(dueDates[1]).toHaveTextContent('Due: No due date');
    });
});

it('displays project names correctly', async () => {
    (getActiveTasks as jest.Mock).mockResolvedValueOnce(mockTasks);
    renderActiveTasks();

    await waitFor(() => {
        expect(screen.getByText('Project: Project A')).toBeInTheDocument();
        expect(screen.getByText('Project: Project B')).toBeInTheDocument();
    });
});

it('maintains correct grid layout', async () => {
    (getActiveTasks as jest.Mock).mockResolvedValueOnce(mockTasks);
    renderActiveTasks();

    await waitFor(() => {
        const gridItems = screen.getAllByRole('article'); // MUI Card has role="article"
        expect(gridItems).toHaveLength(2);
        gridItems.forEach(item => {
            expect(item).toHaveStyle({ cursor: 'pointer' });
        });
    });
});

const renderActiveTasks = () => {
  const navigate = jest.fn();
  jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);
  return {
    navigate,
    ...render(
      <BrowserRouter>
        <ActiveTasks />
      </BrowserRouter>
    ),
  };
};

describe('ActiveTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    (getActiveTasks as jest.Mock).mockResolvedValueOnce(mockTasks);
    renderActiveTasks();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  it('displays correct task information', async () => {
    (getActiveTasks as jest.Mock).mockResolvedValueOnce(mockTasks);
    renderActiveTasks();

    await waitFor(() => {
      expect(screen.getByText('Project: Project A')).toBeInTheDocument();
      expect(screen.getByText('Priority: High')).toBeInTheDocument();
      expect(screen.getByText('Due: Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('Due: No due date')).toBeInTheDocument();
    });
  });

  it('navigates to task detail when card is clicked', async () => {
    (getActiveTasks as jest.Mock).mockResolvedValueOnce(mockTasks);
    const { navigate } = renderActiveTasks();

    await waitFor(() => {
      const taskCard = screen.getByText('Test Task 1').closest('.MuiCard-root');
      fireEvent.click(taskCard!);
      expect(navigate).toHaveBeenCalledWith('/tasks/1');
    });
  });

  it('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (getActiveTasks as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    
    renderActiveTasks();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch active tasks',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});