import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import ProjectForm from '../ProjectForm';
import { createProject, addProjectMember, getProjects } from '../../../api/projects';
import { getUsers } from '../../../api/users';
import { Project } from '../../../types/project';
import { User } from '../../../types/user';

// Mock the modules
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    search: '?parentId=1'
  })
}));

jest.mock('../../../api/projects');
jest.mock('../../../api/users');
jest.mock('../../../hooks/project/useProjectForm', () => ({
  useProjectForm: () => ({
    formData: {
      name: '',
      description: '',
      start_date: '2024-01-01',
      due_date: '2024-12-31',
      status_id: 1,
      parent_id: null
    },
    errors: {},
    dateError: '',
    handleChange: jest.fn(),
    handleStatusChange: jest.fn(),
    handleDateChange: jest.fn(),
    handleParentChange: jest.fn(),
    validateForm: () => true
  })
}));

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'Active',
    start_date: '2024-01-01',
    due_date: '2024-12-31',
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2024-01-01',
    estimated_time: 100,
    spent_time: 0,
    progress: 0
  }
];

const mockUsers: User[] = [
  {
    id: 1,
    login: 'testuser',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    role_id: 1,
    status_id: 1,
    timezone: 'UTC',
    language: 'en',
    avatar_url: null,
    created_on: '2024-01-01',
    updated_on: null,
    last_login: null
  }
];

describe('ProjectForm Component', () => {
  const mockNavigate = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getProjects as jest.Mock).mockResolvedValue(mockProjects);
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (createProject as jest.Mock).mockResolvedValue({ ...mockProjects[0] });
    (addProjectMember as jest.Mock).mockResolvedValue({});
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
  });

  it('renders the project details form initially', async () => {
    await act(async () => {
      render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);
    });

    expect(screen.getByText('Project Details')).toBeInTheDocument();
  });

  it('loads available projects and users on mount', async () => {
    await act(async () => {
      render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);
    });

    expect(getProjects).toHaveBeenCalled();
    expect(getUsers).toHaveBeenCalled();
  });

  it('switches to members form when details are validated', async () => {
    await act(async () => {
      render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);
    });

    const nextButton = screen.getByText('Next');
    await act(async () => {
      fireEvent.click(nextButton);
    });

    expect(screen.getByText('Project Members')).toBeInTheDocument();
  });

  it('shows error when trying to submit without selecting members', async () => {
    await act(async () => {
      render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);
    });

    // Move to members step
    const nextButton = screen.getByText('Next');
    await act(async () => {
      fireEvent.click(nextButton);
    });

    // Try to submit without selecting members
    const createButton = screen.getByText('Create Project');
    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(screen.getByText('Please select at least one project member')).toBeInTheDocument();
  });

  it('successfully creates a project with members', async () => {
    await act(async () => {
      render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);
    });

    // Move to members step
    const nextButton = screen.getByText('Next');
    await act(async () => {
      fireEvent.click(nextButton);
    });

    // Select a member
    const memberCheckbox = screen.getByRole('checkbox');
    await act(async () => {
      fireEvent.click(memberCheckbox);
    });

    // Submit the form
    const createButton = screen.getByText('Create Project');
    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(createProject).toHaveBeenCalled();
    expect(addProjectMember).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });

  it('handles API errors during project creation', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (createProject as jest.Mock).mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);
    });

    // Move to members step
    const nextButton = screen.getByText('Next');
    await act(async () => {
      fireEvent.click(nextButton);
    });

    // Select a member
    const memberCheckbox = screen.getByRole('checkbox');
    await act(async () => {
      fireEvent.click(memberCheckbox);
    });

    // Submit the form
    const createButton = screen.getByText('Create Project');
    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(consoleError).toHaveBeenCalledWith('Failed to create project:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('navigates back to projects list on cancel', async () => {
    await act(async () => {
      render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });
});