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
jest.mock('../Form/TaskNameField', () => ({
  TaskNameField: ({ handleChange }: any) => (
    <input data-testid="task-name" onChange={handleChange} />
  ),
}));

jest.mock('../Form/TaskDescriptionField', () => ({
  TaskDescriptionField: ({ handleChange }: any) => (
    <textarea data-testid="task-description" onChange={handleChange} />
  ),
}));

jest.mock('../ProjectSelect', () => ({
  __esModule: true,
  default: ({ handleChange }: any) => (
    <select data-testid="project-select" onChange={handleChange} />
  ),
}));

// Mock other form components similarly...

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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/tasks/:id?" element={<TaskForm />} />
          </Routes>
        </MemoryRouter>
      </LocalizationProvider>
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
    const mockEvent = { preventDefault: jest.fn() };
    renderTaskForm();
    
    const form = screen.getByRole('form');
    fireEvent.submit(form, mockEvent);

    await waitFor(() => {
      expect(mockEvent.preventDefault).toHaveBeenCalled();
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
      isEditing: true,
    });
    
    renderTaskForm('/tasks/1');
    expect(screen.getByTestId('task-progress')).toBeInTheDocument();

    // Re-render with isEditing false
    (useTaskForm as jest.Mock).mockReturnValue({
      ...mockTaskFormHook,
      isEditing: false,
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
    renderTaskForm();
    
    const taskName = screen.getByTestId('task-name');
    fireEvent.change(taskName, {
      target: { name: 'name', value: 'New Task' }
    });
    
    expect(mockHandleChange).toHaveBeenCalledWith({
      target: { name: 'name', value: 'New Task' }
    });
  });
});