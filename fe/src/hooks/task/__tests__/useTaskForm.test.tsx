import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useTaskForm } from '../useTaskForm';
import {
  getTaskById,
  createTask,
  updateTask,
  getTaskStatuses,
  getPriorities,
  changeTaskStatus
} from '../../../api/tasks';
import { getTaskTags, getTags } from '../../../api/tags';
import { Task, TaskStatus, TaskPriority } from '../../../types/task';
import { Tag } from '../../../types/tag';
import { ProjectMember } from '../../../types/project';

// Mock useNavigate so no real navigation is triggered (jsdom throws on navigation)
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

// No need to mock window.location - taskId is passed as prop

// Mock data
const mockProjectMembers: ProjectMember[] = [
  {
    user_id: 1,
    project_id: 1,
    role: 'Admin',
    name: 'John',
    surname: 'Doe',
    created_on: '2024-01-25T00:00:00Z'
  }
];

// Mock project select hook
jest.mock('../useProjectSelect', () => ({
  useProjectSelect: () => ({
    projects: [],
    projectMembers: mockProjectMembers,
    projectTasks: []
  })
}));

// Mock API calls
jest.mock('../../../api/tasks');
jest.mock('../../../api/tags');

describe('useTaskForm', () => {
  const currentUserId = 1;

  const mockTask: Task = {
    id: 1,
    name: 'Test Task',
    description: 'Test Description',
    project_id: 1,
    project_name: 'Test Project',
    type_id: 1,
    type_name: 'Task',
    priority_id: 1,
    priority_name: 'Medium',
    status_id: 1,
    status_name: 'To Do',
    parent_id: null,
    parent_name: null,
    holder_id: 1,
    holder_name: 'Test Holder',
    assignee_id: 2,
    assignee_name: 'Test Assignee',
    start_date: '2024-01-25T00:00:00Z',
    due_date: '2024-02-25T00:00:00Z',
    end_date: null,
    spent_time: 0,
    estimated_time: 8,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test Creator',
    created_on: '2024-01-25T00:00:00Z'
  };

  const mockStatuses: TaskStatus[] = [
    {
      id: 1,
      name: 'To Do',
      color: '#000000',
      description: null,
      active: true,
      created_on: '2024-01-25T00:00:00Z',
      updated_on: null
    },
    {
      id: 2,
      name: 'In Progress',
      color: '#0000FF',
      description: null,
      active: true,
      created_on: '2024-01-25T00:00:00Z',
      updated_on: null
    }
  ];

  const mockPriorities: TaskPriority[] = [
    {
      id: 1,
      name: 'Low',
      color: '#00FF00',
      description: null,
      active: true,
      created_on: '2024-01-25T00:00:00Z',
      updated_on: null
    },
    {
      id: 2,
      name: 'Medium',
      color: '#FFFF00',
      description: null,
      active: true,
      created_on: '2024-01-25T00:00:00Z',
      updated_on: null
    }
  ];

  const mockTags: Tag[] = [
    {
      id: 1,
      name: 'Frontend',
      color: '#FF0000',
      description: null,
      active: true,
      created_on: '2024-01-25T00:00:00Z',
      created_by: 1
    },
    {
      id: 2,
      name: 'Backend',
      color: '#00FF00',
      description: null,
      active: true,
      created_on: '2024-01-25T00:00:00Z',
      created_by: 1
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getTaskById as jest.Mock).mockResolvedValue(mockTask);
    (getTaskStatuses as jest.Mock).mockResolvedValue(mockStatuses);
    (getPriorities as jest.Mock).mockResolvedValue(mockPriorities);
    (getTags as jest.Mock).mockResolvedValue(mockTags);
    (getTaskTags as jest.Mock).mockResolvedValue([mockTags[0]]);
  });

  it('should initialize with default values for new task', async () => {
    const { result } = renderHook(() => useTaskForm({
      currentUserId,
      projectId: undefined,
      projectIdFromQuery: null,
      parentTaskId: null
    }), { wrapper });

    await waitFor(() => {
      expect(result.current.formData).toMatchObject({
        name: '',
        description: '',
        project_id: null,
        type_id: 1,
        priority_id: 2,
        status_id: 1,
        holder_id: currentUserId,
        assignee_id: null,
        estimated_time: 0,
        progress: 0,
        created_by: currentUserId,
        tags: []
      });
    });
    await waitFor(() => {
      expect(result.current.isEditing).toBe(false);
    });
  });

  it('should load existing task data when taskId is provided', async () => {
    const { result } = renderHook(() => useTaskForm({
      taskId: '1',
      currentUserId,
      projectId: undefined,
      projectIdFromQuery: null,
      parentTaskId: null
    }), { wrapper });

    await waitFor(() => {
      expect(result.current.formData).toMatchObject({
        name: mockTask.name,
        description: mockTask.description,
        project_id: mockTask.project_id,
        type_id: mockTask.type_id,
        priority_id: mockTask.priority_id,
        status_id: mockTask.status_id,
        holder_id: mockTask.holder_id,
        assignee_id: mockTask.assignee_id,
        start_date: expect.any(String),
        due_date: expect.any(String),
        estimated_time: mockTask.estimated_time,
        progress: mockTask.progress,
        created_by: mockTask.created_by,
        tags: [mockTags[0]]
      });
    });
    await waitFor(() => {
      expect(result.current.isEditing).toBe(true);
    });
  });

  it('should handle form field changes', async () => {
    const { result } = renderHook(() => useTaskForm({
      currentUserId,
      projectId: undefined,
      projectIdFromQuery: null,
      parentTaskId: null
    }), { wrapper });

    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'New Task Name' } });
    });

    await waitFor(() => {
      expect(result.current.formData.name).toBe('New Task Name');
    });
  });

  it('should create new task successfully', async () => {
    const newTask = { ...mockTask, id: 2 };
    (createTask as jest.Mock).mockResolvedValue(newTask);

    const { result } = renderHook(() => useTaskForm({
      currentUserId,
      projectId: undefined,
      projectIdFromQuery: null,
      parentTaskId: null
    }), { wrapper });

    // Set required fields for validation (project_id, start_date, due_date, holder_id, assignee_id)
    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'New Task' } });
      result.current.handleChange({ target: { name: 'project_id', value: 1 } });
      result.current.handleChange({ target: { name: 'start_date', value: '2024-01-26T00:00:00Z' } });
      result.current.handleChange({ target: { name: 'due_date', value: '2024-02-26T00:00:00Z' } });
      result.current.handleChange({ target: { name: 'holder_id', value: currentUserId } });
      result.current.handleChange({ target: { name: 'assignee_id', value: 1 } });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    await waitFor(() => {
      expect(createTask).toHaveBeenCalled();
    });
    await waitFor(() => {
      // After fix: should navigate to task details page instead of -1
      expect(mockNavigate).toHaveBeenCalledWith(`/tasks/${newTask.id}`);
    });
  });

  it('should update existing task successfully', async () => {
    const updatedTask = { ...mockTask, name: 'Updated Task' };
    (updateTask as jest.Mock).mockResolvedValue(updatedTask);
    (getTaskById as jest.Mock).mockResolvedValue(mockTask);
    (getTaskTags as jest.Mock).mockResolvedValue([mockTags[0]]);
    const { result } = renderHook(() => useTaskForm({
      taskId: '1',
      currentUserId,
      projectId: undefined,
      projectIdFromQuery: null,
      parentTaskId: null
    }), { wrapper });

    // Wait for edit mode
    await waitFor(() => {
      expect(result.current.isEditing).toBe(true);
    });

    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'Updated Task' } });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalled();
    });
    await waitFor(() => {
      // After fix: should navigate to task details page instead of -1
      expect(mockNavigate).toHaveBeenCalledWith('/tasks/1');
    });
  });

  it('should update task status immediately when editing', async () => {
    const newStatus = 2;
    const updatedTask = { ...mockTask, status_id: newStatus };
    (changeTaskStatus as jest.Mock).mockResolvedValue(updatedTask);
    (getTaskById as jest.Mock).mockResolvedValue(mockTask);
    (getTaskTags as jest.Mock).mockResolvedValue([mockTags[0]]);
    const { result } = renderHook(() => useTaskForm({
      taskId: '1',
      currentUserId,
      projectId: undefined,
      projectIdFromQuery: null,
      parentTaskId: null
    }), { wrapper });

    // Wait for edit mode
    await waitFor(() => {
      expect(result.current.isEditing).toBe(true);
    });

    act(() => {
      result.current.handleChange({ target: { name: 'status_id', value: newStatus } });
    });

    await waitFor(() => {
      expect(changeTaskStatus).toHaveBeenCalledWith(1, newStatus);
    });
    await waitFor(() => {
      expect(result.current.formData.status_id).toBe(newStatus);
    });
  });
});
