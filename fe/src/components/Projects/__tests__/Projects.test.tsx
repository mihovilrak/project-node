import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Projects from '../Projects';
import { getProjects } from '../../../api/projects';
import { Project } from '../../../types/project';

// Mock the modules
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

jest.mock('../../../api/projects');

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Project A',
    description: 'Description A',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'Active',
    start_date: '2024-01-01',
    due_date: '2024-12-31',
    end_date: null,
    created_by: 1,
    created_by_name: 'User 1',
    created_on: '2024-01-01',
    updated_on: null,
    estimated_time: 100,
    spent_time: 50,
    progress: 50
  },
  {
    id: 2,
    name: 'Project B',
    description: 'Description B',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'Active',
    start_date: '2024-01-01',
    due_date: '2024-12-31',
    end_date: null,
    created_by: 1,
    created_by_name: 'User 1',
    created_on: '2024-01-01',
    updated_on: null,
    estimated_time: 100,
    spent_time: 0,
    progress: 0
  }
];

describe('Projects Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getProjects as jest.Mock).mockResolvedValue(mockProjects);
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
  });

  it('renders loading state initially', () => {
    render(<Projects />);
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('renders projects after loading', async () => {
    render(<Projects />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
  });

  it('filters projects by name', async () => {
    render(<Projects />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const filterInput = screen.getByLabelText('Filter by Name');
    await userEvent.type(filterInput, 'Project A');

    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.queryByText('Project B')).not.toBeInTheDocument();
  });

  it('sorts projects in ascending and descending order', async () => {
    render(<Projects />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    
    // Test descending order
    fireEvent.change(sortSelect, { target: { value: 'desc' } });
    const projects = screen.getAllByRole('heading', { level: 6 });
    expect(projects[0]).toHaveTextContent('Project B');
    expect(projects[1]).toHaveTextContent('Project A');
  });

  it('navigates to create project page when clicking create button', async () => {
    render(<Projects />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const createButton = screen.getByText('Create New Project');
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith('/projects/new');
  });

  it('navigates to project details when clicking a project card', async () => {
    render(<Projects />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const projectCard = screen.getByText('Project A').closest('.MuiCard-root');
    fireEvent.click(projectCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });

  it('shows error state when API call fails', async () => {
    const error = new Error('Failed to fetch projects');
    (getProjects as jest.Mock).mockRejectedValue(error);
    
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<Projects />);
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to fetch projects', error);
    });
    
    consoleError.mockRestore();
  });

  it('displays "No projects yet" when project list is empty', async () => {
    (getProjects as jest.Mock).mockResolvedValue([]);
    
    render(<Projects />);
    
    await waitFor(() => {
      expect(screen.getByText('No projects yet.')).toBeInTheDocument();
    });
  });
});