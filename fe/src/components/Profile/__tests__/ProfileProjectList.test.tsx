import React from 'react';
import { render, screen } from '@testing-library/react';
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
      progress: 75,
      parent_id: null,
      parent_name: null,
      status_id: 1,
      status_name: 'Active',
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-01T00:00:00Z',
      estimated_time: 100,
      spent_time: 75
    },
    {
      id: 2,
      name: 'Test Project 2',
      description: 'Test Description 2',
      start_date: '2024-01-01',
      due_date: '2024-02-01',
      progress: 25,
      parent_id: null,
      parent_name: null,
      status_id: 1,
      status_name: 'Active',
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-01T00:00:00Z',
      estimated_time: 80,
      spent_time: 20
    }
  ];

  it('should show loading spinner when loading is true', () => {
    render(<ProfileProjectList projects={[]} loading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
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
    expect(screen.getByText('Due: 1/1/2024')).toBeInTheDocument();
    expect(screen.getByText('Due: 2/1/2024')).toBeInTheDocument();
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(2);
  });
});