import { renderHook, waitFor } from '@testing-library/react';
import {
  useTaskFileWrapper,
  useTimeLogCalendarWrapper,
  useTaskTimeLogsWrapper,
} from '../useAppRoutes';
import { getTaskById } from '../../../api/tasks';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Task } from '../../../types/task';
import logger from '../../../utils/logger';

// Mock the tasks API
jest.mock('../../../api/tasks');
const mockedGetTaskById = getTaskById as jest.MockedFunction<
  typeof getTaskById
>;

// No need to mock window.location - useParams is used instead

describe('useTaskFileWrapper', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={['/tasks/1/files']}>
      <Routes>
        <Route path="/tasks/:id/files" element={children} />
      </Routes>
    </MemoryRouter>
  );

  it('should return the taskId from the route', () => {
    const { result } = renderHook(() => useTaskFileWrapper(), { wrapper });

    expect(result.current.taskId).toBe(1);
  });
});

describe('useTimeLogCalendarWrapper', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={['/projects/2/time-logs/calendar']}>
      <Routes>
        <Route
          path="/projects/:projectId/time-logs/calendar"
          element={children}
        />
      </Routes>
    </MemoryRouter>
  );

  it('should return correct projectId from URL', () => {
    const { result } = renderHook(() => useTimeLogCalendarWrapper(), {
      wrapper,
    });

    expect(result.current.projectId).toBe(2);
  });
});

describe('useTaskTimeLogsWrapper', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={['/tasks/1']}>
      <Routes>
        <Route path="/tasks/:id" element={children} />
      </Routes>
    </MemoryRouter>
  );

  beforeEach(() => {
    mockedGetTaskById.mockClear();
  });

  it('should fetch task data on mount', async () => {
    const mockTask: Task = {
      id: 1,
      name: 'Test Task',
      project_id: 1,
      project_name: 'Test Project',
      holder_id: 1,
      holder_name: 'Test Holder',
      assignee_id: 1,
      assignee_name: 'Test Assignee',
      parent_id: null,
      parent_name: null,
      description: 'Test Description',
      type_id: 1,
      type_name: 'Test Type',
      status_id: 1,
      status_name: 'Test Status',
      priority_id: 1,
      priority_name: 'Test Priority',
      start_date: null,
      due_date: null,
      end_date: null,
      spent_time: 0,
      progress: 0,
      created_on: new Date().toISOString(),
      created_by: 1,
      created_by_name: 'Test Creator',
      estimated_time: null,
    };
    mockedGetTaskById.mockResolvedValueOnce(mockTask);

    const { result } = renderHook(() => useTaskTimeLogsWrapper(), { wrapper });

    expect(result.current.task).toBeNull();

    await waitFor(() => {
      expect(mockedGetTaskById).toHaveBeenCalledWith(
        1,
        expect.any(AbortSignal),
      );
      expect(result.current.task).toEqual(mockTask);
    });
  });

  it('should handle fetch error gracefully', async () => {
    mockedGetTaskById.mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useTaskTimeLogsWrapper(), { wrapper });

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch task:',
        expect.any(Error),
      );
      expect(result.current.task).toBeNull();
    });
  });
});
