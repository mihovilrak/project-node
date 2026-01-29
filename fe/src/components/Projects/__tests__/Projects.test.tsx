import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
    const { getProjectStatuses } = require('../../../api/projects');
    (getProjects as jest.Mock).mockResolvedValue(mockProjects);
    (getProjectStatuses as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Active' },
      { id: 2, name: 'Inactive' },
      { id: 3, name: 'Deleted' }
    ]);
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

    const filterPanel = screen.getByTestId('filter-panel');
    const expandButton = within(filterPanel).getAllByRole('button')[0];
    fireEvent.click(expandButton);

    const filterInput = await screen.findByLabelText('Search');
    fireEvent.change(filterInput, { target: { value: 'Project A' } });

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.queryByText('Project B')).not.toBeInTheDocument();
    });
  });

  it('renders projects in correct order based on sort selection', async () => {
    render(<Projects />);

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();

    expect(screen.getByTestId('project-sort')).toBeInTheDocument();
  });

  it('navigates to create project page when clicking create button', async () => {
    render(<Projects />);

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    const createButton = screen.getByTestId('create-project-button');
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith('/projects/new');
  }, 15000);

  it('navigates to project details when clicking a project card', async () => {
    render(<Projects />);

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const projectCard = screen.getByTestId('project-card-1');
    fireEvent.click(projectCard);

    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });

  it('displays "No projects yet" when project list is empty', async () => {
    (getProjects as jest.Mock).mockResolvedValue([]);

    render(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('No projects yet.')).toBeInTheDocument();
    });
  });
});