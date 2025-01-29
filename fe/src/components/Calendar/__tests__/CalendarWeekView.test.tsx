import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CalendarWeekView from '../CalendarWeekView';
import { Task } from '../../../types/task';
import { TimeLog } from '../../../types/timeLog';

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock useCalendarWeek hook
jest.mock('../../../hooks/calendar/useCalendarWeek', () => ({
  useCalendarWeek: () => ({
    getWeekDays: () => [
      new Date('2023-01-01'),
      new Date('2023-01-02'),
      new Date('2023-01-03'),
      new Date('2023-01-04'),
      new Date('2023-01-05'),
      new Date('2023-01-06'),
      new Date('2023-01-07'),
    ],
    getTasksForDay: () => mockTasks,
    getTimeLogsForDay: () => mockTimeLogs,
  }),
}));

const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Test Task',
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
    type_name: 'Task',
    status_id: 1,
    status_name: 'New',
    priority_id: 1,
    priority_name: 'High/Should',
    start_date: '2023-01-01T09:00:00',
    due_date: '2023-01-01T17:00:00',
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test Creator',
    created_on: '2023-01-01T08:00:00',
    estimated_time: 8
  }
];

const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    log_date: '2023-01-01',
    spent_time: 60,
    description: 'Test Time Log',
    created_on: '2023-01-01T10:00:00',
    updated_on: null,
    task_name: 'Test Task',
    activity_type_color: '#FF0000'
  }
];

const defaultProps = {
  date: new Date('2023-01-01'),
  tasks: mockTasks,
  timeLogs: mockTimeLogs,
  view: 'week' as const,
  onDateChange: jest.fn(),
  onViewChange: jest.fn(),
  onTaskClick: jest.fn(),
  onTimeLogClick: jest.fn()
};

describe('CalendarWeekView', () => {
  const renderCalendarWeekView = () =>
    render(
      <MemoryRouter>
        <CalendarWeekView {...defaultProps} />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders week days correctly', () => {
    renderCalendarWeekView();
    expect(screen.getByText(/Sunday, January 1/)).toBeInTheDocument();
    expect(screen.getByText(/Saturday, January 7/)).toBeInTheDocument();
  });

  test('renders tasks with correct information', () => {
    renderCalendarWeekView();
    expect(screen.getByText(/Test Task/)).toBeInTheDocument();
    expect(screen.getByText(/High\/Should/)).toBeInTheDocument();
    expect(screen.getByText(/New/)).toBeInTheDocument();
  });

  test('renders time logs with correct information', () => {
    renderCalendarWeekView();
    expect(screen.getByText(/Test Task \(60 minutes\)/)).toBeInTheDocument();
  });

  test('handles task click', () => {
    renderCalendarWeekView();
    const taskElement = screen.getByText(/Test Task/);
    fireEvent.click(taskElement);
    expect(defaultProps.onTaskClick).toHaveBeenCalledWith(1);
  });

  test('handles time log click', () => {
    renderCalendarWeekView();
    const timeLogElement = screen.getByText(/Test Task \(60 minutes\)/);
    fireEvent.click(timeLogElement);
    expect(defaultProps.onTimeLogClick).toHaveBeenCalledWith(1);
  });

  test('handles day selection', () => {
    renderCalendarWeekView();
    const dayElement = screen.getByText(/Sunday, January 1/);
    fireEvent.click(dayElement);
    expect(defaultProps.onDateChange).toHaveBeenCalledWith(expect.any(Date));
    expect(defaultProps.onViewChange).toHaveBeenCalledWith('day');
  });

  test('highlights current day', () => {
    // Mock current date to match one of the days
    jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));
    renderCalendarWeekView();
    
    const papers = screen.getAllByRole('article');
    const todayPaper = papers.find(paper => 
      paper.style.backgroundColor === 'var(--action-hover)'
    );
    expect(todayPaper).toBeTruthy();
    
    jest.useRealTimers();
  });

  test('formats dates correctly', () => {
    renderCalendarWeekView();
    const task = screen.getByText(/09:00/);
    expect(task).toBeInTheDocument();
    expect(screen.getByText(/17:00/)).toBeInTheDocument();
  });
});