import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarMonthView from '../CalendarMonthView';
import { useCalendarDays } from '../../../hooks/calendar/useCalendarDays';
import { CalendarViewProps, CalendarDay } from '../../../types/calendar';
import { Task } from '../../../types/task';
import { TimeLog } from '../../../types/timeLog';

// Mock the useCalendarDays hook
jest.mock('../../../hooks/calendar/useCalendarDays');

const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Task 1',
    project_id: 1,
    project_name: 'Test Project',
    holder_id: 1,
    holder_name: 'Test Holder',
    assignee_id: 1,
    assignee_name: 'Test Assignee',
    parent_id: null,
    parent_name: null,
    description: '',
    type_id: 1,
    type_name: 'Test Type',
    type_color: '#000000',
    type_icon: 'task',
    status_id: 1,
    status_name: 'Open',
    priority_id: 1,
    priority_name: 'high/should',
    priority_color: '#ff0000',
    start_date: '2024-03-15',
    due_date: null,
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test Creator',
    created_on: '2024-03-15',
    estimated_time: null
  },
  {
    id: 2,
    name: 'Task 2',
    project_id: 1,
    project_name: 'Test Project',
    holder_id: 1,
    holder_name: 'Test Holder',
    assignee_id: 1,
    assignee_name: 'Test Assignee',
    parent_id: null,
    parent_name: null,
    description: '',
    type_id: 1,
    type_name: 'Test Type',
    type_color: '#000000',
    type_icon: 'task',
    status_id: 1,
    status_name: 'Open',
    priority_id: 2,
    priority_name: 'normal/could',
    priority_color: '#00ff00',
    start_date: '2024-03-15',
    due_date: null,
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test Creator',
    created_on: '2024-03-15',
    estimated_time: null
  }
];

const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    log_date: '2023-01-01',
    spent_time: 120,
    description: '',
    created_on: '2023-01-01',
    updated_on: null
  }
];

const mockCalendarDay: CalendarDay = {
  date: new Date(2023, 0, 1),
  isCurrentMonth: true,
  isToday: true,
  isWeekend: true,
  tasks: mockTasks,
  timeLogs: mockTimeLogs,
  totalTime: 120
};

const mockProps: CalendarViewProps = {
  date: new Date(2024, 2, 15),
  view: 'month',
  tasks: mockTasks,
  timeLogs: [
    {
      id: 1,
      task_id: 1,
      spent_time: 120,
      created_on: '2024-03-15',
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-03-15',
      description: '',
      updated_on: null
    }
  ],
  onDateChange: jest.fn(),
  onViewChange: jest.fn(),
  onTaskClick: jest.fn(),
  onTimeLogClick: jest.fn()
};

describe('CalendarMonthView', () => {
  beforeEach(() => {
    (useCalendarDays as jest.Mock).mockReturnValue({
      getDaysInMonth: () => Array(42).fill(mockCalendarDay)
    });
  });

  it('renders days of the week', () => {
    render(<CalendarMonthView {...mockProps} />);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekDays.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('renders tasks for each day', () => {
    render(<CalendarMonthView {...mockProps} />);
    expect(screen.getAllByText('Task 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Task 2').length).toBeGreaterThan(0);
  });

  it('shows time logged summary when totalTime > 0', () => {
    render(<CalendarMonthView {...mockProps} />);
    expect(screen.getAllByText('Time logged: 2h 0m').length).toBeGreaterThan(0);
  });

  it('calls onDateChange and onViewChange when clicking a day', () => {
    render(<CalendarMonthView {...mockProps} />);
    const dayElement = screen.getAllByText('1')[0];
    fireEvent.click(dayElement.closest('div[role="button"]') || dayElement);
    expect(mockProps.onDateChange).toHaveBeenCalled();
    expect(mockProps.onViewChange).toHaveBeenCalledWith('day');
  });

  it('calls onTaskClick when clicking a task chip', () => {
    render(<CalendarMonthView {...mockProps} />);
    const taskChip = screen.getAllByText('Task 1')[0];
    fireEvent.click(taskChip);
    expect(mockProps.onTaskClick).toHaveBeenCalledWith(1);
  });

  it('shows more indicator when there are more than 3 tasks', () => {
    const manyTasks = Array(5).fill(mockCalendarDay.tasks[0]);
    (useCalendarDays as jest.Mock).mockReturnValue({
      getDaysInMonth: () => [{
        ...mockCalendarDay,
        tasks: manyTasks
      }]
    });

    render(<CalendarMonthView {...mockProps} />);
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('applies correct styling for today', () => {
    render(<CalendarMonthView {...mockProps} />);
    const papers = document.querySelectorAll('.MuiPaper-root');
    expect(papers[0]).toHaveStyle({ backgroundColor: 'var(--action-hover)' });
  });
});