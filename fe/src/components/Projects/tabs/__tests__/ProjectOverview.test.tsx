import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProjectOverview from '../ProjectOverview';
import { useProjectOverview } from '../../../../hooks/project/useProjectOverview';
import { Project } from '../../../../types/project';

jest.mock('../../../../hooks/project/useProjectOverview');

jest.mock('../../../common/PermissionButton', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="permission-button">
      {children}
    </button>
  ),
}));

const mockProject: Project = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  parent_id: 2,
  parent_name: 'Parent Project',
  status_id: 1,
  status_name: 'Active',
  start_date: '2024-01-01',
  due_date: '2024-12-31',
  end_date: null,
  created_by: 1,
  created_by_name: 'John Doe',
  created_on: '2024-01-01',
  updated_on: null,
  estimated_time: 100,
  spent_time: 60,
  progress: 50,
};

const mockSubprojects = [
  { id: 3, name: 'Subproject 1' },
  { id: 4, name: 'Subproject 2' },
];

describe('ProjectOverview Component', () => {
  beforeEach(() => {
    (useProjectOverview as jest.Mock).mockReturnValue({
      subprojects: mockSubprojects,
      handleAddSubproject: jest.fn(),
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test('shows loading state when project or projectDetails is null', () => {
    renderWithRouter(<ProjectOverview project={null} projectDetails={null} />);
    expect(screen.getByText('Loading project details...')).toBeInTheDocument();
  });

  test('renders project details correctly', () => {
    const { container } = renderWithRouter(<ProjectOverview project={mockProject} projectDetails={mockProject} />);

    const descriptionText = container.textContent;
    expect(descriptionText).toContain('Test Description');

    expect(descriptionText).toContain('Active');

    const parentLink = container.querySelector('a[href="/projects/2"]');
    expect(parentLink).not.toBeNull();
    expect(parentLink?.textContent).toContain('Parent Project');

    const creatorLink = container.querySelector('a[href="/users/1"]');
    expect(creatorLink).not.toBeNull();
    expect(creatorLink?.textContent).toContain('John Doe');

    expect(descriptionText).toContain('50%');

    expect(descriptionText).toContain('100 hours');
    expect(descriptionText).toContain('60.00 hours'); // spent_time is already in hours, no division needed
  });

  test('renders subprojects list correctly', () => {
    renderWithRouter(<ProjectOverview project={mockProject} projectDetails={mockProject} />);

    expect(screen.getByText('Subproject 1')).toBeInTheDocument();
    expect(screen.getByText('Subproject 2')).toBeInTheDocument();
  });

  test('displays "No subprojects found" when no subprojects exist', () => {
    (useProjectOverview as jest.Mock).mockReturnValue({
      subprojects: [],
      handleAddSubproject: jest.fn(),
    });

    renderWithRouter(<ProjectOverview project={mockProject} projectDetails={mockProject} />);
    expect(screen.getByText('No subprojects found')).toBeInTheDocument();
  });

  test('renders parent project link correctly', () => {
    renderWithRouter(<ProjectOverview project={mockProject} projectDetails={mockProject} />);

    const parentLink = screen.getByText('Parent Project');
    expect(parentLink).toHaveAttribute('href', '/projects/2');
  });

  test('renders created by link correctly', () => {
    renderWithRouter(<ProjectOverview project={mockProject} projectDetails={mockProject} />);

    const createdByLink = screen.getByText('John Doe');
    expect(createdByLink).toHaveAttribute('href', '/users/1');
  });

  test('handles add subproject button click', () => {
    const mockHandleAddSubproject = jest.fn();
    (useProjectOverview as jest.Mock).mockReturnValue({
      subprojects: mockSubprojects,
      handleAddSubproject: mockHandleAddSubproject,
    });

    renderWithRouter(<ProjectOverview project={mockProject} projectDetails={mockProject} />);

    const addButton = screen.getByTestId('permission-button');
    fireEvent.click(addButton);
    expect(mockHandleAddSubproject).toHaveBeenCalled();
  });

  test('renders progress bar correctly', () => {
    const { container } = renderWithRouter(<ProjectOverview project={mockProject} projectDetails={mockProject} />);

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).not.toBeNull();

    if (progressBar) {
      expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
    }
  });

  test('handles null spent_time correctly', () => {
    const projectWithNullSpentTime = {
      ...mockProject,
      spent_time: null as any
    };
    const { container } = renderWithRouter(
      <ProjectOverview project={projectWithNullSpentTime} projectDetails={projectWithNullSpentTime} />
    );

    const descriptionText = container.textContent;
    // Should display 0.00 hours when spent_time is null
    expect(descriptionText).toContain('0.00 hours');
  });

  test('handles undefined spent_time correctly', () => {
    const projectWithUndefinedSpentTime = {
      ...mockProject,
      spent_time: undefined as any
    };
    const { container } = renderWithRouter(
      <ProjectOverview project={projectWithUndefinedSpentTime} projectDetails={projectWithUndefinedSpentTime} />
    );

    const descriptionText = container.textContent;
    // Should display 0.00 hours when spent_time is undefined
    expect(descriptionText).toContain('0.00 hours');
  });
});