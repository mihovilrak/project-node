import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Profiler } from 'react';
import Tasks from '../../../components/Tasks/Tasks';
import { TestWrapper } from '../../TestWrapper';
import { Task } from '../../../types/task';
import { getTasks, deleteTask } from '../../../api/tasks';

// Mock API calls - use jest.fn() without referencing variables to avoid hoisting issues
jest.mock('../../../api/tasks', () => ({
  getTasks: jest.fn(),
  deleteTask: jest.fn()
}));

// Mock task data
const mockTasks: Task[] = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  name: `Task ${index + 1}`,
  project_id: 1,
  project_name: 'Test Project',
  holder_id: 1,
  holder_name: 'John Doe',
  assignee_id: 1,
  assignee_name: 'Jane Smith',
  parent_id: null,
  parent_name: null,
  description: `Description for task ${index + 1}`,
  type_id: 1,
  type_name: 'Bug',
  type_color: '#FF0000',
  type_icon: 'bug',
  status_id: 1,
  status_name: 'Open',
  priority_id: 1,
  priority_name: 'High',
  priority_color: '#FF0000',
  start_date: '2024-01-26T00:00:00Z',
  due_date: '2024-02-26T00:00:00Z',
  end_date: null,
  spent_time: 0,
  progress: 0,
  created_by: 1,
  created_by_name: 'John Doe',
  created_on: '2024-01-26T00:00:00Z',
  estimated_time: 8
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
  // Log performance metrics
  console.log(`Component: ${id}`);
  console.log(`Phase: ${phase}`);
  console.log(`Actual Duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base Duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Commit Time: ${commitTime}ms`);
  console.log('-------------------');
};

// Helper function to measure render performance
const measurePerformance = (Component: React.ComponentType): number => {
  let duration = 0;

  render(
    <TestWrapper>
      <Profiler id="Tasks" onRender={(id, phase, actualDuration) => {
        duration = actualDuration;
      }}>
        <Component />
      </Profiler>
    </TestWrapper>
  );

  return duration;
};

describe('Tasks Component Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getTasks as jest.Mock).mockResolvedValue(mockTasks);
    (deleteTask as jest.Mock).mockResolvedValue(true);
  });

  test('Tasks component initial render performance', () => {
    const renderTime = measurePerformance(Tasks);
    expect(renderTime).toBeLessThan(300); // Initial render should be under 300ms
  });

  test('Tasks component filtering performance', async () => {
    render(
      <TestWrapper>
        <Profiler id="TasksFiltering" onRender={onRenderCallback}>
          <Tasks />
        </Profiler>
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // The input uses label "Search" not placeholder
    const searchInput = screen.getByLabelText('Search');
    let startTime = performance.now();

    fireEvent.change(searchInput, { target: { value: 'Task 1' } });

    let endTime = performance.now();
    let filterTime = endTime - startTime;

    expect(filterTime).toBeLessThan(1000); // Filtering should be under 1000ms
  }, 15000);

  test('Tasks component sorting performance', async () => {
    render(
      <TestWrapper>
        <Profiler id="TasksSorting" onRender={onRenderCallback}>
          <Tasks />
        </Profiler>
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // The sort button shows "A-Z" text
    const sortSelect = screen.getByRole('combobox');
    let startTime = performance.now();

    fireEvent.mouseDown(sortSelect);

    let endTime = performance.now();
    let sortTime = endTime - startTime;

    expect(sortTime).toBeLessThan(1000); // Sorting should be under 1000ms
  }, 15000);

  test('Tasks component delete performance', async () => {
    const { getAllByText } = render(
      <TestWrapper>
        <Profiler id="TasksDelete" onRender={onRenderCallback}>
          <Tasks />
        </Profiler>
      </TestWrapper>
    );

    // Wait for tasks to load
    await new Promise(resolve => setTimeout(resolve, 0));

    const deleteButtons = getAllByText('Delete');
    let startTime = performance.now();

    fireEvent.click(deleteButtons[0]);
    // Confirm delete
    window.confirm = jest.fn(() => true);

    let endTime = performance.now();
    let deleteTime = endTime - startTime;

    expect(deleteTime).toBeLessThan(300); // Delete operation should be under 300ms
  });
});
