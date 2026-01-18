import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskDetailsContent from '../TaskDetailsContent';
import { Task} from '../../../types/task';
import { TimeLog } from '../../../types/timeLog';
import { Comment } from '../../../types/comment';

// Mock child components
jest.mock('../SubtaskList', () => ({
  __esModule: true,
  default: ({ subtasks, onSubtaskDeleted, onSubtaskUpdated }: any) => (
    <div data-testid="subtask-list">
      {subtasks.map((subtask: Task) => (
        <div key={subtask.id} data-testid={`subtask-${subtask.id}`}>
          {subtask.name}
          <button onClick={() => onSubtaskDeleted(subtask.id)}>Delete</button>
          <button onClick={() => onSubtaskUpdated(subtask.id, subtask)}>Update</button>
        </div>
      ))}
    </div>
  )
}));

jest.mock('../TaskTimeLogging', () => ({
  __esModule: true,
  default: ({ timeLogs, onTimeLogSubmit, onTimeLogDelete, onTimeLogEdit }: any) => (
    <div data-testid="time-logging">
      {timeLogs.map((log: TimeLog) => (
        <div key={log.id} data-testid={`time-log-${log.id}`}>
          {log.spent_time}
          <button onClick={() => onTimeLogDelete(log.id)}>Delete</button>
          <button onClick={() => onTimeLogEdit(log)}>Edit</button>
        </div>
      ))}
    </div>
  )
}));

jest.mock('../TaskCommentSection', () => ({
  __esModule: true,
  default: ({ comments, onCommentSubmit, onCommentDelete }: any) => (
    <div data-testid="comment-section">
      {comments.map((comment: Comment) => (
        <div key={comment.id} data-testid={`comment-${comment.id}`}>
          {comment.comment}
          <button onClick={() => onCommentDelete(comment.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}));

const mockTask: Task = {
  id: 1,
  name: 'Test Task',
  project_id: 1,
  project_name: 'Test Project',
  holder_id: 1,
  holder_name: 'Test Holder',
  assignee_id: 2,
  assignee_name: 'Test Assignee',
  parent_id: null,
  parent_name: null,
  description: 'Test Description',
  type_id: 1,
  type_name: 'Task',
  status_id: 1,
  status_name: 'New',
  priority_id: 1,
  priority_name: 'Normal/Could',
  start_date: '2023-01-01',
  due_date: '2023-12-31',
  end_date: null,
  spent_time: 0,
  progress: 0,
  created_by: 1,
  created_by_name: 'Test Creator',
  created_on: '2023-01-01',
  estimated_time: 8
};

const mockSubtasks: Task[] = [
  { ...mockTask, id: 2, name: 'Subtask 1', parent_id: 1 },
  { ...mockTask, id: 3, name: 'Subtask 2', parent_id: 1 }
];

const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    spent_time: 2,
    log_date: '2024-03-20',
    description: 'Work on feature',
    created_on: '2024-03-20T10:00:00Z',
    updated_on: null
  },
  {
    id: 2,
    task_id: 1,
    user_id: 1,
    activity_type_id: 1,
    spent_time: 3,
    log_date: '2024-03-21',
    description: 'Continue work',
    created_on: '2024-03-21T10:00:00Z',
    updated_on: null
  }
];

const mockComments: Comment[] = [
  {
    id: 1,
    task_id: 1,
    comment: 'First comment',
    user_id: 1,
    user_name: 'John Doe',
    created_on: '2024-03-20T10:00:00Z',
    updated_on: null,
    active: true
  },
  {
    id: 2,
    task_id: 1,
    comment: 'Second comment',
    user_id: 1,
    user_name: 'John Doe',
    created_on: '2024-03-21T10:00:00Z',
    updated_on: null,
    active: true
  }
];

const mockProps = {
  id: '1',
  task: mockTask,
  subtasks: mockSubtasks,
  timeLogs: mockTimeLogs,
  comments: mockComments,
  timeLogDialogOpen: false,
  selectedTimeLog: null,
  editingComment: null,
  onSubtaskDeleted: jest.fn(),
  onSubtaskUpdated: jest.fn(),
  onTimeLogSubmit: jest.fn(),
  onTimeLogDelete: jest.fn(),
  onTimeLogEdit: jest.fn(),
  onTimeLogDialogClose: jest.fn(),
  onCommentSubmit: jest.fn(),
  onCommentUpdate: jest.fn(),
  onCommentDelete: jest.fn(),
  onEditStart: jest.fn(),
  onEditEnd: jest.fn(),
  onAddSubtaskClick: jest.fn(),
  onTimeLogClick: jest.fn()
};

describe('TaskDetailsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all sections correctly', () => {
    render(<TaskDetailsContent {...mockProps} />);

    expect(screen.getByText('Subtasks:')).toBeInTheDocument();
    expect(screen.getByText('Time Logs:')).toBeInTheDocument();
    expect(screen.getByText('Comments:')).toBeInTheDocument();
    expect(screen.getByText('Add Subtask')).toBeInTheDocument();
    expect(screen.getByText('Log Time')).toBeInTheDocument();
  });

  it('handles subtask interactions correctly', () => {
    render(<TaskDetailsContent {...mockProps} />);

    const subtaskList = screen.getByTestId('subtask-list');
    expect(subtaskList).toBeInTheDocument();

    mockSubtasks.forEach(subtask => {
      expect(screen.getByTestId(`subtask-${subtask.id}`)).toBeInTheDocument();
    });
  });

  it('handles time log interactions correctly', () => {
    render(<TaskDetailsContent {...mockProps} />);

    const timeLogging = screen.getByTestId('time-logging');
    expect(timeLogging).toBeInTheDocument();

    mockTimeLogs.forEach(log => {
      expect(screen.getByTestId(`time-log-${log.id}`)).toBeInTheDocument();
    });
  });

  it('handles comment interactions correctly', () => {
    render(<TaskDetailsContent {...mockProps} />);

    const commentSection = screen.getByTestId('comment-section');
    expect(commentSection).toBeInTheDocument();

    mockComments.forEach(comment => {
      expect(screen.getByTestId(`comment-${comment.id}`)).toBeInTheDocument();
    });
  });

  it('calls onAddSubtaskClick when Add Subtask button is clicked', () => {
    render(<TaskDetailsContent {...mockProps} />);

    const addSubtaskButton = screen.getByText('Add Subtask');
    fireEvent.click(addSubtaskButton);

    expect(mockProps.onAddSubtaskClick).toHaveBeenCalledTimes(1);
  });

  it('calls onTimeLogClick when Log Time button is clicked', () => {
    render(<TaskDetailsContent {...mockProps} />);

    const logTimeButton = screen.getByText('Log Time');
    fireEvent.click(logTimeButton);

    expect(mockProps.onTimeLogClick).toHaveBeenCalledTimes(1);
  });

  it('passes correct props to child components', () => {
    render(<TaskDetailsContent {...mockProps} />);

    // SubtaskList props
    expect(screen.getByTestId('subtask-list')).toBeInTheDocument();

    // TaskTimeLogging props
    expect(screen.getByTestId('time-logging')).toBeInTheDocument();

    // TaskCommentSection props
    expect(screen.getByTestId('comment-section')).toBeInTheDocument();
  });
});