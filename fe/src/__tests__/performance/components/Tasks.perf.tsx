import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Profiler } from 'react';
import Tasks from '../../../components/Tasks/Tasks';
import { TestWrapper } from '../../TestWrapper';
import { Task } from '../../../types/task';

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

// Mock API calls
jest.mock('../../../api/tasks', () => ({
  getTasks: jest.fn().mockResolvedValue(mockTasks),
  deleteTask: jest.fn().mockResolvedValue(true)
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
  test('Tasks component initial render performance', () => {
    const renderTime = measurePerformance(Tasks);
    expect(renderTime).toBeLessThan(100); // Initial render should be under 100ms
  });

  test('Tasks component filtering performance', () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <Profiler id="TasksFiltering" onRender={onRenderCallback}>
          <Tasks />
        </Profiler>
      </TestWrapper>
    );

    const searchInput = getByPlaceholderText('Search...');
    let startTime = performance.now();
    
    fireEvent.change(searchInput, { target: { value: 'Task 1' } });
    
    let endTime = performance.now();
    let filterTime = endTime - startTime;
    
    expect(filterTime).toBeLessThan(50); // Filtering should be under 50ms
  });

  test('Tasks component sorting performance', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <Profiler id="TasksSorting" onRender={onRenderCallback}>
          <Tasks />
        </Profiler>
      </TestWrapper>
    );

    const sortSelect = getByLabelText('Sort Order');
    let startTime = performance.now();
    
    fireEvent.change(sortSelect, { target: { value: 'desc' } });
    
    let endTime = performance.now();
    let sortTime = endTime - startTime;
    
    expect(sortTime).toBeLessThan(50); // Sorting should be under 50ms
  });

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
    
    expect(deleteTime).toBeLessThan(50); // Delete operation should be under 50ms
  });
});
