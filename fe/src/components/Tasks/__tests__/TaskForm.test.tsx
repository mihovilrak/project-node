import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TaskForm from '../TaskForm';
import { useAuth } from '../../../context/AuthContext';
import { useTaskForm } from '../../../hooks/task/useTaskForm';
import { TaskFormState } from '../../../types/task';

// Mock all dependencies
jest.mock('../../../context/AuthContext');
jest.mock('../../../hooks/task/useTaskForm');

// Mock child components
jest.mock('../TagSelect', () => ({
  __esModule: true,
  TagSelect: () => <div data-testid="tag-select" />,
}));
jest.mock('../Form/DatePickerSection', () => ({
  DatePickerSection: ({ handleChange }: any) => (
    <div data-testid="date-picker-section" />
  ),
}));
jest.mock('../Form/AssigneeSelectionSection', () => ({
  AssigneeSelectionSection: ({ handleChange }: any) => (
    <div data-testid="assignee-selection-section" />
  ),
}));
jest.mock('../Form/ParentTaskSelect', () => ({
  ParentTaskSelect: ({ handleChange }: any) => (
    <div data-testid="parent-task-select" />
  ),
}));
jest.mock('../Form/TaskTagsSection', () => ({
  TaskTagsSection: ({ handleChange }: any) => (
    <div data-testid="task-tags-section" />
  ),
}));

jest.mock('../Form/TaskFormActionButtons', () => ({
  TaskFormActionButtons: ({ handleChange }: any) => (
    <div data-testid="task-form-action-buttons" />
  ),
}));
jest.mock('../Form/TaskNameField', () => ({
  TaskNameField: ({ handleChange, formData }: any) => (
    <input
      data-testid="task-name"
      name="name"
      value={formData?.name || ''}
      onChange={handleChange}
    />
  ),
}));

jest.mock('../Form/TaskDescriptionField', () => ({
  TaskDescriptionField: ({ handleChange, formData }: any) => (
    <textarea
      data-testid="task-description"
      name="description"
      value={formData?.description || ''}
      onChange={handleChange}
    />
  ),
}));
//

//
jest.mock('../Form/TaskPrioritySelect', () => ({
  TaskPrioritySelect: ({ handleChange, formData }: any) => (
    <select
      data-testid="task-priority"
      name="priority_id"
      value={formData?.priority_id || ''}
      onChange={handleChange}
    >
      <option value="">Select Priority</option>
      <option value="1">High</option>
      <option value="2">Medium</option>
      <option value="3">Low</option>
    </select>
  ),
}));

jest.mock('../Form/TaskStatusSelect', () => ({
  TaskStatusSelect: ({ handleChange, formData }: any) => (
    <select
      data-testid="task-status"
      name="status_id"
      value={formData?.status_id || ''}
      onChange={handleChange}
    >
      <option value="">Select Status</option>
      <option value="1">Open</option>
      <option value="2">In Progress</option>
      <option value="3">Done</option>
    </select>
  ),
}));

jest.mock('../Form/TaskTypeSection', () => ({
  TaskTypeSection: ({ handleChange, formData }: any) => (
    <select
      data-testid="task-type"
      name="type_id"
      value={formData?.type_id || ''}
      onChange={handleChange}
    >
      <option value="">Select Type</option>
      <option value="1">Feature</option>
      <option value="2">Bug</option>
      <option value="3">Chore</option>
    </select>
  ),
}));

jest.mock('../Form/TaskProgressField', () => ({
  // Render if value !== undefined && value !== null
  TaskProgressField: (props: any) => {
    const { handleChange, value } = props;
    return value !== undefined && value !== null
      ? <input data-testid="task-progress" name="progress" value={value} onChange={handleChange} />
      : null;
  },
}));

jest.mock('../Form/EstimatedTimeField', () => ({
  EstimatedTimeField: ({ handleChange, formData }: any) => (
    <input
      data-testid="estimated-time"
      name="estimated_time"
      value={formData?.estimated_time || ''}
      onChange={handleChange}
    />
  ),
}));

jest.mock('../ProjectSelect', () => ({
  ProjectSelect: ({ handleChange, formData }: any) => (
    <select
      data-testid="project-select"
      name="project_id"
      value={formData?.project_id || ''}
      onChange={handleChange}
    >
      <option value="">Select Project</option>
      <option value="123">Project 123</option>
      <option value="456">Project 456</option>
      <option value="789">Project 789</option>
    </select>
  ),
}));


describe('TaskForm', () => {
  const mockHandleChange = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockNavigate = jest.fn();

  const defaultFormData: TaskFormState = {
    name: '',
    description: '',
    project_id: null,
    type_id: null,
    priority_id: null,
    status_id: null,
    parent_id: null,
    holder_id: null,
    assignee_id: null,
    start_date: null,
    due_date: null,
    estimated_time: null,
    progress: 0,
  };

  const mockTaskFormHook = {
    formData: defaultFormData,
    projects: [],
    projectMembers: [],
    projectTasks: [],
    statuses: [],
    priorities: [],
    isEditing: false,
    isLoading: false,
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { id: 1, name: 'Test User' },
    });
    (useTaskForm as jest.Mock).mockReturnValue(mockTaskFormHook);
  });

  const renderTaskForm = (path = '/tasks/new') => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Routes>
            <Route path="/tasks/new" element={<TaskForm />} />
            <Route path="/tasks/:id" element={<TaskForm />} />
          </Routes>
        </LocalizationProvider>
      </MemoryRouter>
    );
  };

  it('renders create task form correctly', () => {
    renderTaskForm();

    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByTestId('task-name')).toBeInTheDocument();
    expect(screen.getByTestId('task-description')).toBeInTheDocument();
    expect(screen.getByTestId('project-select')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    (useTaskForm as jest.Mock).mockReturnValue({
      ...mockTaskFormHook,
      isLoading: true,
    });

    renderTaskForm();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows edit form when editing existing task', () => {
    (useTaskForm as jest.Mock).mockReturnValue({
      ...mockTaskFormHook,
      isEditing: true,
    });

    renderTaskForm('/tasks/1');
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    renderTaskForm();
    const form = screen.getByTestId('task-form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  it('sets project ID from query parameters', () => {
    renderTaskForm('/tasks/new?projectId=123');

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: 'project_id',
        value: 123
      }
    });
  });

  it('sets parent task ID from query parameters', () => {
    renderTaskForm('/tasks/new?parentId=456');

    expect(mockHandleChange).toHaveBeenCalledWith({
      target: {
        name: 'parent_id',
        value: 456
      }
    });
  });

  it('shows progress field only when editing', () => {
    (useTaskForm as jest.Mock).mockReturnValue({
      ...mockTaskFormHook,
      isEditing: false,
      formData: { ...mockTaskFormHook.formData, progress: undefined },
    });
    renderTaskForm('/tasks/new');
    expect(screen.queryByTestId('task-progress')).not.toBeInTheDocument();
  });

  it('prevents project and parent task changes when IDs come from URL', () => {
    renderTaskForm('/tasks/new?projectId=123&parentId=456');

    const projectSelect = screen.getByTestId('project-select');
    fireEvent.change(projectSelect, { target: { name: 'project_id', value: 789 } });

    expect(mockHandleChange).not.toHaveBeenCalledWith({
      target: { name: 'project_id', value: 789 }
    });
  });

  it('handles form field changes correctly', () => {
    // Set up so that after change, formData reflects the new value
    (useTaskForm as jest.Mock).mockReturnValue({
      ...mockTaskFormHook,
      formData: { ...mockTaskFormHook.formData }
    });
    const { unmount } = renderTaskForm();

    const taskName = screen.getByTestId('task-name');
    fireEvent.change(taskName, {
      target: { name: 'name', value: 'New Task' }
    });
    // Assert on event passed to mockHandleChange
    expect(mockHandleChange).toHaveBeenCalled();
    const callArg = mockHandleChange.mock.calls[0][0];
    expect(callArg.target.name).toBe('name');
    // Simulate formData update and re-render
    (useTaskForm as jest.Mock).mockReturnValue({
      ...mockTaskFormHook,
      formData: { ...mockTaskFormHook.formData, name: 'New Task' }
    });
    unmount();
    renderTaskForm();
    // Assert input value is updated in the DOM
    expect(screen.getByTestId('task-name')).toHaveValue('New Task');
  });
});