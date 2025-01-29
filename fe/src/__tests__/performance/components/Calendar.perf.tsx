import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import Calendar from '../../../components/Calendar/Calendar';
import CalendarDayView from '../../../components/Calendar/CalendarDayView';
import CalendarWeekView from '../../../components/Calendar/CalendarWeekView';
import CalendarMonthView from '../../../components/Calendar/CalendarMonthView';
import { TestWrapper } from '../../TestWrapper';

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

describe('Calendar Components Performance Tests', () => {
  // Helper function to measure render performance
  const measurePerformance = (Component: React.ComponentType<any>, props = {}) => {
    const start = performance.now();
    
    render(
      <TestWrapper>
        <Profiler id={Component.name} onRender={onRenderCallback}>
          <Component {...props} />
        </Profiler>
      </TestWrapper>
    );
    
    const end = performance.now();
    return end - start;
  };

  // Test initial render performance
  test('Calendar component initial render performance', () => {
    const renderTime = measurePerformance(Calendar);
    expect(renderTime).toBeLessThan(200); // Should render under 200ms
  });

  test('CalendarDayView component initial render performance', () => {
    const renderTime = measurePerformance(CalendarDayView, {
      date: new Date(),
      tasks: [],
      timeLogs: [],
      onTaskClick: () => {},
      onTimeLogClick: () => {}
    });
    expect(renderTime).toBeLessThan(100); // Should render under 100ms
  });

  test('CalendarWeekView component initial render performance', () => {
    const renderTime = measurePerformance(CalendarWeekView, {
      date: new Date(),
      tasks: [],
      timeLogs: [],
      onTaskClick: () => {},
      onTimeLogClick: () => {}
    });
    expect(renderTime).toBeLessThan(150); // Should render under 150ms
  });

  test('CalendarMonthView component initial render performance', () => {
    const renderTime = measurePerformance(CalendarMonthView, {
      date: new Date(),
      tasks: [],
      timeLogs: [],
      onTaskClick: () => {},
      onTimeLogClick: () => {}
    });
    expect(renderTime).toBeLessThan(150); // Should render under 150ms
  });

  // Test re-render performance with data updates
  test('Calendar components re-render performance with data', () => {
    const mockTasks = Array(50).fill(null).map((_, i) => ({
      id: i,
      title: `Task ${i}`,
      description: 'Test task',
      dueDate: new Date(),
      status: 'pending'
    }));

    const mockTimeLogs = Array(20).fill(null).map((_, i) => ({
      id: i,
      taskId: i,
      startTime: new Date(),
      endTime: new Date(),
      duration: 3600
    }));

    const renderTime = measurePerformance(Calendar, {
      initialTasks: mockTasks,
      initialTimeLogs: mockTimeLogs
    });
    
    expect(renderTime).toBeLessThan(300); // Should render under 300ms with substantial data
  });
});
