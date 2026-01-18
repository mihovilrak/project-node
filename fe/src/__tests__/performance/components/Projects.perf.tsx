import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import Projects from '../../../components/Projects/Projects';
import { TestWrapper } from '../../TestWrapper';
import { Project } from '../../../types/project';
import { getProjects } from '../../../api/projects';

// Mock API response - use jest.fn() without referencing variables to avoid hoisting issues
jest.mock('../../../api/projects', () => ({
  getProjects: jest.fn()
}));

// Mock project data
const mockProjects: Project[] = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  name: `Project ${index + 1}`,
  description: `Test project ${index + 1}`,
  parent_id: null,
  parent_name: null,
  status_id: 1,
  status_name: 'Active',
  start_date: '2024-01-26T00:00:00Z',
  due_date: '2024-02-26T00:00:00Z',
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2024-01-26T00:00:00Z',
  estimated_time: 80,
  spent_time: 20,
  progress: 25
}));

// Performance measurement callback
const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  console.log(`Component: ${id}`);
  console.log(`Phase: ${phase}`);
  console.log(`Actual Duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base Duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Commit Time: ${commitTime}ms`);
  console.log('-------------------');
};

// Helper function to measure render performance
const measurePerformance = (Component: React.ComponentType<any>, props = {}): number => {
  let duration = 0;

  render(
    <TestWrapper>
      <Profiler id="ProjectsComponent" onRender={(id, phase, actualDuration) => {
        duration = actualDuration;
      }}>
        <Component {...props} />
      </Profiler>
    </TestWrapper>
  );

  return duration;
};

describe('Projects Component Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getProjects as jest.Mock).mockResolvedValue(mockProjects);
  });

  test('Projects component initial render performance', () => {
    const renderTime = measurePerformance(Projects);
    expect(renderTime).toBeLessThan(300); // Initial render should be relatively quick
  });

  test('Projects component render performance with filter', async () => {
    const renderTime = measurePerformance(Projects, {
      initialFilter: 'Project 1' // Test filtering performance
    });
    expect(renderTime).toBeLessThan(300); // Filtering should be efficient
  });

  test('Projects component render performance with sort', async () => {
    const renderTime = measurePerformance(Projects, {
      initialSortOrder: 'desc' // Test sorting performance
    });
    expect(renderTime).toBeLessThan(300); // Sorting should be efficient
  });

  test('Projects component render performance with large dataset', async () => {
    // Create a larger dataset to test performance with more items
    const largeDataset = Array.from({ length: 100 }, (_, index) => ({
      ...mockProjects[0],
      id: index + 1,
      name: `Project ${index + 1}`
    }));

    (getProjects as jest.Mock).mockResolvedValueOnce(largeDataset);

    const renderTime = measurePerformance(Projects);
    expect(renderTime).toBeLessThan(500); // Should handle large datasets efficiently
  });

  test('Projects component render performance with empty state', async () => {
    (getProjects as jest.Mock).mockResolvedValueOnce([]);

    const renderTime = measurePerformance(Projects);
    expect(renderTime).toBeLessThan(300); // Empty state should render very quickly
  });

  // Test grid layout performance
  test('Projects grid layout render performance', async () => {
    const renderTime = measurePerformance(Projects, {
      projects: mockProjects.slice(0, 10) // Test with 10 projects
    });
    expect(renderTime).toBeLessThan(300); // Grid layout should render efficiently
  });
});
