import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Projects from '../Projects';
import { getProjects } from '../../../api/projects';
import { Project } from '../../../types/project';

// Mock the modules
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../../../api/projects');
jest.mock('../../../api/users', () => ({
  getUserOptions: jest.fn().mockResolvedValue([]),
}));

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
    progress: 50,
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
    progress: 0,
  },
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
      { id: 3, name: 'Deleted' },
    ]);
    jest
      .spyOn(require('react-router-dom'), 'useNavigate')
      .mockReturnValue(mockNavigate);
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

    await userEvent.click(
      screen.getByRole('button', { name: /expand filters/i }),
    );
    await userEvent.click(screen.getByTestId('add-filter-search'));
    const filterPanel = screen.getByTestId('filter-panel');
    const searchValueInput = within(filterPanel).getByRole('textbox', {
      name: /value/i,
    });
    await userEvent.type(searchValueInput, 'Project A');
    await userEvent.click(
      screen.getByRole('button', { name: /apply filters/i }),
    );

    await waitFor(
      () => {
        expect(screen.getByText('Project A')).toBeInTheDocument();
        expect(screen.queryByText('Project B')).not.toBeInTheDocument();
      },
      { timeout: 8000 },
    );
  }, 10000);

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

    await waitFor(
      () => {
        expect(
          screen.queryByText('Loading projects...'),
        ).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    const createButton = screen.getByTestId('create-project-button');
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith('/projects/new');
  }, 15000);

  it('project title links to project details', async () => {
    render(<Projects />);

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const card1 = screen.getByTestId('project-card-1');
    const projectTitle = within(card1).getByRole('heading', {
      name: /Project A/i,
    });
    expect(projectTitle).toHaveTextContent('Project A');
    expect(
      projectTitle.getAttribute('href') ?? projectTitle.getAttribute('to'),
    ).toBe('/projects/1');
  });

  it('displays "No projects yet" when project list is empty', async () => {
    (getProjects as jest.Mock).mockResolvedValue([]);

    render(<Projects />);

    await waitFor(() => {
      expect(screen.getByText('No projects yet.')).toBeInTheDocument();
    });
  });

  it('displays project card with title and progress bar only in grid view', async () => {
    render(<Projects />);

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const card1 = screen.getByTestId('project-card-1');
    expect(
      within(card1).getByRole('heading', { name: /Project A/i }),
    ).toBeInTheDocument();
    expect(within(card1).getByText('50%')).toBeInTheDocument();
  });

  it('displays project card with title and progress in list view when toggled', async () => {
    render(<Projects />);

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const listViewButton = screen.getByRole('button', { name: /list view/i });
    fireEvent.click(listViewButton);

    const card1 = screen.getByTestId('project-card-1');
    expect(
      within(card1).getByRole('heading', { name: /Project A/i }),
    ).toBeInTheDocument();
    expect(within(card1).getByText('50%')).toBeInTheDocument();
  });

  it('shows expand arrow and subprojects inside same card when project has children', async () => {
    const projectsWithChild = [
      ...mockProjects,
      {
        ...mockProjects[0],
        id: 3,
        name: 'Subproject A1',
        parent_id: 1,
      },
    ];
    (getProjects as jest.Mock).mockResolvedValue(projectsWithChild);

    render(<Projects />);

    await waitFor(() => {
      expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
    });

    const expandButton = screen.getByRole('button', {
      name: /expand subprojects/i,
    });
    expect(expandButton).toBeInTheDocument();
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Subproject A1')).toBeInTheDocument();
    });
    const card1 = screen.getByTestId('project-card-1');
    expect(within(card1).getByText('Subproject A1')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /collapse subprojects/i }),
    ).toBeInTheDocument();
  });

  it('shows nested subprojects at every level', async () => {
    (getProjects as jest.Mock).mockResolvedValue([
      mockProjects[0],
      { ...mockProjects[0], id: 3, name: 'Subproject A1', parent_id: 1 },
      { ...mockProjects[0], id: 4, name: 'Grandchild A1a', parent_id: 3 },
    ]);

    render(<Projects />);

    fireEvent.click(
      await screen.findByRole('button', { name: /expand subprojects/i }),
    );
    const card1 = screen.getByTestId('project-card-1');
    expect(within(card1).getByText('Grandchild A1a')).toBeInTheDocument();
  });

  it('shows projects whose parent is not in the result as roots', async () => {
    (getProjects as jest.Mock).mockResolvedValue([
      { ...mockProjects[0], id: 3, name: 'Subproject A1', parent_id: 1 },
    ]);

    render(<Projects />);

    expect(await screen.findByText('Subproject A1')).toBeInTheDocument();
    expect(screen.queryByText('No projects yet.')).not.toBeInTheDocument();
  });

  it('searches client-side and loads options once', async () => {
    const { getProjectStatuses } = require('../../../api/projects');
    const { getUserOptions } = require('../../../api/users');
    render(<Projects />);

    await screen.findByText('Project A');
    // One call for the list, one for the parent options.
    expect(getProjects).toHaveBeenCalledTimes(2);

    await userEvent.click(
      screen.getByRole('button', { name: /expand filters/i }),
    );
    await userEvent.click(screen.getByTestId('add-filter-search'));
    await userEvent.type(
      within(screen.getByTestId('filter-panel')).getByRole('textbox', {
        name: /value/i,
      }),
      'Project B',
    );
    await userEvent.click(
      screen.getByRole('button', { name: /apply filters/i }),
    );

    await waitFor(() => {
      expect(screen.queryByText('Project A')).not.toBeInTheDocument();
    });
    expect(getProjects).toHaveBeenCalledTimes(2);
    expect(getProjectStatuses).toHaveBeenCalledTimes(1);
    expect(getUserOptions).toHaveBeenCalledTimes(1);
  }, 15000);
});
