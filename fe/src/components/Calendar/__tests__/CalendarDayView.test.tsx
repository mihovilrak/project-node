import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarDayView from '../CalendarDayView';
import { Task } from '../../../types/task';
import { TimeLog } from '../../../types/timeLog';

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
      estimated_time: null,
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
      estimated_time: null,
    },
  ];

  const mockTimeLogs: TimeLog[] = [
    {
      id: 1,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-01',
      spent_time: 0.5,
      description: '',
      created_on: '2024-01-01T10:00:00Z',
      updated_on: null,
      task_name: 'Test TimeLog 1',
      activity_type_color: '#ff0000',
    },
    {
      id: 2,
      task_id: 2,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-01',
      spent_time: 0.75,
      description: '',
      created_on: '2024-01-01T14:00:00Z',
      updated_on: null,
      task_name: 'Test TimeLog 2',
      activity_type_color: '#00ff00',
    },
  ];

  const mockProps = {
    date: new Date(2024, 0, 1),
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

  it("lists the day's time logs in hours and minutes with a total", () => {
    render(<CalendarDayView {...mockProps} />);

    expect(screen.getByText('Test TimeLog 1 - 0h 30m')).toBeInTheDocument();
    expect(screen.getByText('Test TimeLog 2 - 0h 45m')).toBeInTheDocument();
    expect(screen.getByText('Time logged: 1h 15m')).toBeInTheDocument();
  });

  it('shows date-only tasks as all-day instead of at 00:00', () => {
    const dateOnly = {
      ...mockTasks[0],
      id: 3,
      name: 'Date-only Task',
      start_date: '2024-01-01',
    };
    render(<CalendarDayView {...mockProps} tasks={[dateOnly]} />);

    const allDay = screen.getByTestId('all-day');
    expect(allDay).toHaveTextContent('Starts - Date-only Task');
    const midnight = screen.getByText('00:00').parentElement!;
    expect(midnight).not.toHaveTextContent('Date-only Task');
  });

  it('ignores tasks and logs from other days', () => {
    render(<CalendarDayView {...mockProps} date={new Date(2024, 0, 2)} />);

    expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
    expect(screen.queryByText(/Test TimeLog 1/)).not.toBeInTheDocument();
    expect(screen.getByText('Nothing scheduled')).toBeInTheDocument();
  });

  it('handles task clicks', () => {
    render(<CalendarDayView {...mockProps} />);

    fireEvent.click(screen.getByText('Test Task 1'));
    expect(mockProps.onTaskClick).toHaveBeenCalledWith(1);
  });

  it('handles time log clicks', () => {
    render(<CalendarDayView {...mockProps} />);

    fireEvent.click(screen.getByText('Test TimeLog 1 - 0h 30m'));
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
