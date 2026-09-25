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
    estimated_time: null,
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
    estimated_time: null,
  },
];

const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    log_date: '2023-01-01',
    spent_time: 2,
    description: '',
    created_on: '2023-01-01',
    updated_on: null,
  },
];

const mockCalendarDay: CalendarDay = {
  date: new Date(2023, 0, 1),
  isCurrentMonth: true,
  isToday: true,
  isWeekend: true,
  tasks: mockTasks,
  timeLogs: mockTimeLogs,
  totalTime: 2,
};

const buildMonth = (overrides: Partial<CalendarDay> = {}): CalendarDay[] =>
  Array.from({ length: 42 }, (_, index) => ({
    ...mockCalendarDay,
    date: new Date(2023, 0, 1 + index),
    isToday: index === 0,
    ...overrides,
  }));

const mockProps: CalendarViewProps = {
  date: new Date(2024, 2, 15),
  view: 'month',
  tasks: mockTasks,
  timeLogs: [
    {
      id: 1,
      task_id: 1,
      spent_time: 2,
      created_on: '2024-03-15',
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-03-15',
      description: '',
      updated_on: null,
    },
  ],
  onDateChange: jest.fn(),
  onViewChange: jest.fn(),
  onTaskClick: jest.fn(),
  onTimeLogClick: jest.fn(),
};

describe('CalendarMonthView', () => {
  beforeEach(() => {
    (useCalendarDays as jest.Mock).mockReturnValue({
      getDaysInMonth: () => buildMonth(),
    });
  });

  it('renders days of the week', () => {
    render(<CalendarMonthView {...mockProps} />);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekDays.forEach((day) => {
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

  it('does not render a stray 0 on days without logged time', () => {
    (useCalendarDays as jest.Mock).mockReturnValue({
      getDaysInMonth: () =>
        buildMonth({ tasks: [], timeLogs: [], totalTime: 0 }),
    });
    render(<CalendarMonthView {...mockProps} />);
    expect(screen.queryByText(/Time logged/)).not.toBeInTheDocument();
    screen.getAllByTestId('month-day').forEach((cell) => {
      expect(cell.textContent).toMatch(/^\d{1,2}$/);
      expect(cell.textContent).not.toBe('0');
    });
  });

  it('lays out headers and days in a 7-column grid', () => {
    render(<CalendarMonthView {...mockProps} />);
    const grid = screen.getByTestId('month-grid');
    expect(grid).toHaveStyle({ display: 'grid' });
    expect(getComputedStyle(grid).gridTemplateColumns).toContain('repeat(7');
    expect(screen.getAllByTestId('weekday-header')).toHaveLength(7);
    expect(screen.getAllByTestId('month-day')).toHaveLength(42);
    expect(grid.children[7]).toHaveTextContent(/^1/);
  });

  it('formats fractional hours without rounding up', () => {
    (useCalendarDays as jest.Mock).mockReturnValue({
      getDaysInMonth: () => buildMonth({ tasks: [], totalTime: 1.75 }),
    });
    render(<CalendarMonthView {...mockProps} />);
    expect(screen.getAllByText('Time logged: 1h 45m')).toHaveLength(42);
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
      getDaysInMonth: () => [
        {
          ...mockCalendarDay,
          tasks: manyTasks.map((task, index) => ({ ...task, id: index + 10 })),
        },
      ],
    });

    render(<CalendarMonthView {...mockProps} />);
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('applies correct styling for today', () => {
    render(<CalendarMonthView {...mockProps} />);
    const papers = document.querySelectorAll('.MuiPaper-root');
    // Check that the paper exists and has a backgroundColor style (MUI theme value)
    expect(papers[0]).toBeInTheDocument();
    const computedStyle = window.getComputedStyle(papers[0]);
    expect(computedStyle.backgroundColor).toBeTruthy();
  });
});
