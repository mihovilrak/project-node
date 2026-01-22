import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileStats from '../ProfileStats';
import { ProfileStats as ProfileStatsType } from '../../../types/profile';

const mockStats: ProfileStatsType = {
  totalTasks: 10,
  completedTasks: 5,
  activeProjects: 3,
  totalHours: 40
};

const emptyStats: ProfileStatsType = {
  totalTasks: 0,
  completedTasks: 0,
  activeProjects: 0,
  totalHours: 0
};

describe('ProfileStats', () => {
  it('renders loading state correctly', () => {
    render(<ProfileStats stats={mockStats} loading={true} />);
    const loaders = screen.getAllByRole('progressbar');
    expect(loaders).toHaveLength(4);
  });

  it('renders all stat cards with correct values', () => {
    render(<ProfileStats stats={mockStats} loading={false} />);

    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    expect(screen.getByText('Hours Logged')).toBeInTheDocument();
    expect(screen.getByText('40h')).toBeInTheDocument();
  });

  it('renders zero values correctly', () => {
    render(<ProfileStats stats={emptyStats} loading={false} />);
    expect(screen.getAllByText('0')).toHaveLength(3); // Tasks and Projects
    expect(screen.getByText('0h')).toBeInTheDocument(); // Hours
  });

  it('renders correct grid layout', () => {
    const { container } = render(<ProfileStats stats={mockStats} loading={false} />);
    // In Grid v2, we check for Grid container children instead of MuiGrid-item class
    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
    const statCards = screen.getAllByText(/Total Tasks|Completed Tasks|Active Projects|Hours Logged/);
    expect(statCards.length).toBe(4);
  });

  describe('StatCard', () => {
    it('displays correct icon color', () => {
      render(<ProfileStats stats={mockStats} loading={false} />);
      const icons = document.querySelectorAll('.MuiSvgIcon-colorPrimary');
      expect(icons.length).toBe(4);
    });

    it('shows loading spinner when loading prop is true', () => {
      render(<ProfileStats stats={mockStats} loading={true} />);
      const spinners = screen.getAllByRole('progressbar');
      expect(spinners.length).toBe(4);
    });
  });
});