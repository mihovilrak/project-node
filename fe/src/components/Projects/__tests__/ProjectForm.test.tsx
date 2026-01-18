import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import ProjectForm from '../ProjectForm';
import { createProject, addProjectMember, getProjects } from '../../../api/projects';
import { getUsers } from '../../../api/users';
import { Project } from '../../../types/project';
import { User } from '../../../types/user';

// Mock the DatePicker component to make testing easier
jest.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => children,
  DatePicker: ({ label, onChange, value }: { label: string; onChange: (date: any) => void; value: any }) => (
    <div data-testid={`date-picker-${label}`}>
      <label htmlFor={`date-input-${label}`}>{label}</label>
      <input
        type="date"
        id={`date-input-${label}`}
        data-testid="date-input"
        onChange={(e) => onChange(dayjs(e.target.value))}
        value={value ? value.format('YYYY-MM-DD') : ''}
      />
    </div>
  ),
}));

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
    end_date: null,
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2024-01-01',
    estimated_time: 100,
    spent_time: 0,
    progress: 0,
    updated_on: null
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

  test('renders the project details form initially', async () => {
    render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Project Details')).toBeInTheDocument();
    });
  });

  test('loads available projects and users on mount', async () => {
    render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(getProjects).toHaveBeenCalled();
      expect(getUsers).toHaveBeenCalled();
    });
  });

  test('switches to members form when Next is clicked', async () => {
    render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

    // Find and click the Next button
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
    });

    // Verify members form is displayed
    await waitFor(() => {
      expect(screen.getByText('Project Members')).toBeInTheDocument();
    });
  });

  test('shows error when trying to submit without selecting members', async () => {
    render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

    // Navigate to members step
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
    });

    // Try to submit without selecting members
    await waitFor(() => {
      const createButton = screen.getByText('Create Project');
      fireEvent.click(createButton);
    });

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Please select at least one project member')).toBeInTheDocument();
    });
  });

  test('successfully creates a project with members', async () => {
    render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

    // Navigate to members step
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
    });

    // Select a member
    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
    });

    // Submit the form
    await waitFor(() => {
      const createButton = screen.getByText('Create Project');
      fireEvent.click(createButton);
    });

    // Verify project was created
    await waitFor(() => {
      expect(createProject).toHaveBeenCalled();
      expect(addProjectMember).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
    });
  });

  test('handles API errors during project creation', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (createProject as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

    // Navigate to members step
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
    });

    // Select a member
    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
    });

    // Submit the form
    await waitFor(() => {
      const createButton = screen.getByText('Create Project');
      fireEvent.click(createButton);
    });

    // Verify error handling
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to create project:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  // This test is split into two separate tests to isolate the functionality
  // First test just verifies the cancel button exists
  test('renders cancel button correctly', async () => {
    const { container } = render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockOnClose} />);

    // Verify that cancel button exists
    await waitFor(() => {
      const cancelButton = container.querySelector('[data-testid="cancel-button"]');
      expect(cancelButton).not.toBeNull();
    });
  });

  // Second test mock the handleCancel function directly
  test('calls onClose when Cancel button is clicked', async () => {
    const mockClose = jest.fn();
    const { container } = render(<ProjectForm onSubmit={mockOnSubmit} onClose={mockClose} />);

    // Find and click the cancel button
    const cancelButton = await waitFor(() => {
      const button = container.querySelector('[data-testid="cancel-button"]');
      expect(button).not.toBeNull();
      return button as HTMLElement;
    });

    // Click the button
    fireEvent.click(cancelButton);

    // Verify onClose was called
    expect(mockClose).toHaveBeenCalled();
  });
});