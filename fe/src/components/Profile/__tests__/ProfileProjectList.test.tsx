import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileProjectList from '../ProfileProjectList';
import { Project } from '../../../types/project';

describe('ProfileProjectList', () => {
  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Test Project 1',
      description: 'Test Description 1',
      start_date: '2023-12-01',
      due_date: '2024-01-01',
      end_date: null,
      progress: 75,
      parent_id: null,
      parent_name: null,
      status_id: 1,
      status_name: 'Active',
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-01T00:00:00Z',
      updated_on: null,
      estimated_time: 100,
      spent_time: 75
    },
    {
      id: 2,
      name: 'Test Project 2',
      description: 'Test Description 2',
      start_date: '2024-01-01',
      due_date: '2024-02-01',
      end_date: null,
      progress: 25,
      parent_id: null,
      parent_name: null,
      status_id: 1,
      status_name: 'Active',
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-01T00:00:00Z',
      updated_on: null,
      estimated_time: 80,
      spent_time: 20
    }
  ];

  it('should show loading spinner when loading is true', () => {
    render(<ProfileProjectList projects={[]} loading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render empty list when no projects are provided', () => {
    render(<ProfileProjectList projects={[]} loading={false} />);
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('should render list of projects', () => {
    render(<ProfileProjectList projects={mockProjects} loading={false} />);
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  it('should render project details correctly', () => {
    render(<ProfileProjectList projects={mockProjects} loading={false} />);

    // Use more flexible date text matching
    const listItems = screen.getAllByRole('listitem');

    // Check first project
    const firstItem = listItems[0];
    expect(within(firstItem).getByText(/due:/i)).toBeInTheDocument();

    // Check second project
    const secondItem = listItems[1];
    expect(within(secondItem).getByText(/due:/i)).toBeInTheDocument();

    // Check for progress bars by test id
    const progressBars = screen.getAllByTestId('project-progress');
    expect(progressBars).toHaveLength(2);
  });
});