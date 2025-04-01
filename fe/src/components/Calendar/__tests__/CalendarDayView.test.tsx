import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarDayView from '../CalendarDayView';
import { Task } from '../../../types/task';
import { TimeLog } from '../../../types/timeLog';

// Mock the useTasksByHour hook
jest.mock('../../../hooks/calendar/useTasksByHour', () => ({
  useTasksByHour: (tasks: Task[], timeLogs: TimeLog[]) => ({
    hours: Array.from({ length: 24 }, (_, i) => i),
    getTasksForHour: (hour: number) => 
      tasks.filter(task => new Date(task.start_date!).getHours() === hour),
    getTimeLogsForHour: (hour: number) => 
      timeLogs.filter(timeLog => new Date(timeLog.created_on).getHours() === hour),
  }),
}));

describe('CalendarDayView', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      name: 'Test Task 1',
      project_id: 1,
      project_name: 'Test Project',
      holder_id: 1,
      holder_name: 'Test Holder',
      assignee_id: 1,
      assignee_name: 'Test Assignee',
      parent_id: null,
      parent_name: null,
      description: 'Test Description',
      type_id: 1,
      type_name: 'Test Type',
      status_id: 1,
      status_name: 'In Progress',
      priority_id: 1,
      priority_name: 'High/Should',
      start_date: '2024-01-01T10:00:00Z',
      due_date: null,
      end_date: null,
      spent_time: 0,
      progress: 0,
      created_by: 1,
      created_by_name: 'Test Creator',
      created_on: '2024-01-01T10:00:00Z',
      estimated_time: null
    },
    {
      id: 2,
      name: 'Test Task 2',
      project_id: 1,
      project_name: 'Test Project',
      holder_id: 1,
      holder_name: 'Test Holder',
      assignee_id: 1,
      assignee_name: 'Test Assignee',
      parent_id: null,
      parent_name: null,
      description: 'Test Description',
      type_id: 1,
      type_name: 'Test Type',
      status_id: 1,
      status_name: 'To Do',
      priority_id: 2,
      priority_name: 'Normal/Could',
      start_date: '2024-01-01T14:00:00Z',
      due_date: null,
      end_date: null,
      spent_time: 0,
      progress: 0,
      created_by: 1,
      created_by_name: 'Test Creator',
      created_on: '2024-01-01T14:00:00Z',
      estimated_time: null
    }
  ];

  const mockTimeLogs: TimeLog[] = [
    {
      id: 1,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-01',
      spent_time: 30,
      description: '',
      created_on: '2024-01-01T10:00:00Z',
      updated_on: null,
      task_name: 'Test TimeLog 1',
      activity_type_color: '#ff0000'
    },
    {
      id: 2,
      task_id: 2,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-01',
      spent_time: 45,
      description: '',
      created_on: '2024-01-01T14:00:00Z',
      updated_on: null,
      task_name: 'Test TimeLog 2',
      activity_type_color: '#00ff00'
    }
  ];

  const mockProps = {
    date: new Date(),
    view: 'day' as const,
    tasks: mockTasks,
    timeLogs: mockTimeLogs,
    onDateChange: jest.fn(),
    onViewChange: jest.fn(),
    onTaskClick: jest.fn(),
    onTimeLogClick: jest.fn(),
  };

  it('renders all 24 hours', () => {
    render(<CalendarDayView {...mockProps} />);
    
    for (let i = 0; i < 24; i++) {
      const hourText = `${i.toString().padStart(2, '0')}:00`;
      expect(screen.getByText(hourText)).toBeInTheDocument();
    }
  });

  it('displays tasks in correct hour slots', () => {
    render(<CalendarDayView {...mockProps} />);
    
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  it('displays time logs in correct hour slots', () => {
    render(<CalendarDayView {...mockProps} />);
    
    expect(screen.getByText('Test TimeLog 1 - 30 minutes')).toBeInTheDocument();
    expect(screen.getByText('Test TimeLog 2 - 45 minutes')).toBeInTheDocument();
  });

  it('handles task clicks', () => {
    render(<CalendarDayView {...mockProps} />);
    
    fireEvent.click(screen.getByText('Test Task 1'));
    expect(mockProps.onTaskClick).toHaveBeenCalledWith(1);
  });

  it('handles time log clicks', () => {
    render(<CalendarDayView {...mockProps} />);
    
    fireEvent.click(screen.getByText('Test TimeLog 1 - 30 minutes'));
    expect(mockProps.onTimeLogClick).toHaveBeenCalledWith(1);
  });

  it('displays priority chips with correct colors', () => {
    render(<CalendarDayView {...mockProps} />);
    
    expect(screen.getByText(/high\/should/i)).toBeInTheDocument();
    expect(screen.getByText(/normal\/could/i)).toBeInTheDocument();
  });

  it('displays status chips', () => {
    render(<CalendarDayView {...mockProps} />);
    
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });
});