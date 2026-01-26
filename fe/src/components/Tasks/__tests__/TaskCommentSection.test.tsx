import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TaskCommentSection from '../TaskCommentSection';
import { Comment, TaskCommentSectionProps } from '../../../types/comment';

// Mock child components
jest.mock('../../Comments/CommentForm', () => ({
  __esModule: true,
  default: ({ onCommentAdded }: any) => (
    <div data-testid="comment-form">
      <button onClick={() => onCommentAdded({ id: 999, comment: 'New comment' })}>
        Add Comment
      </button>
    </div>
  ),
}));

jest.mock('../../Comments/CommentList', () => ({
  __esModule: true,
  default: ({ comments, onCommentUpdated, onCommentDeleted }: any) => (
    <div data-testid="comment-list">
      {comments.map((comment: Comment) => (
        <div key={comment.id} data-testid={`comment-${comment.id}`}>
          {comment.comment}
          <button onClick={() => onCommentUpdated(comment.id, 'Updated text')}>
            Update
          </button>
          <button onClick={() => onCommentDeleted(comment.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../Comments/CommentEditDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onSave }: any) => (
    open ? (
      <div data-testid="edit-dialog">
        <button onClick={() => onSave(1, 'Updated comment')}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

const mockComments: Comment[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    comment: 'Test comment 1',
    active: true,
    created_on: '2023-01-01',
    updated_on: null,
    user_name: 'User 1'
  },
  {
    id: 2,
    task_id: 1,
    user_id: 2,
    comment: 'Test comment 2',
    active: true,
    created_on: '2023-01-02',
    updated_on: null,
    user_name: 'User 2'
  }
];

const mockProps: TaskCommentSectionProps = {
  taskId: 1,
  comments: mockComments,
  editingComment: null,  // Initialize as null
  onCommentSubmit: jest.fn(),
  onCommentUpdate: jest.fn(),
  onCommentDelete: jest.fn(),
  onEditStart: jest.fn(),
  onEditEnd: jest.fn()
};

describe('TaskCommentSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = mockProps) => {
    return render(
      <MemoryRouter>
        <TaskCommentSection {...props} />
      </MemoryRouter>
    );
  };

  test('renders all components correctly', () => {
    renderComponent();
    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    expect(screen.queryByTestId('edit-dialog')).not.toBeInTheDocument();
  });

  test('handles new comment submission', async () => {
    const mockOnCommentRefresh = jest.fn();
    const propsWithRefresh = {
      ...mockProps,
      onCommentRefresh: mockOnCommentRefresh
    };
    renderComponent(propsWithRefresh);
    const addButton = screen.getByText('Add Comment');
    fireEvent.click(addButton);

    // After fix: onCommentRefresh should be called instead of onCommentSubmit
    // to avoid duplicate comment creation
    await waitFor(() => {
      expect(mockOnCommentRefresh).toHaveBeenCalled();
    });
    // onCommentSubmit should NOT be called since comment is already created
    expect(mockProps.onCommentSubmit).not.toHaveBeenCalled();
  });

  test('handles comment update', async () => {
    renderComponent();
    const updateButton = screen.getByTestId('comment-1').querySelector('button:first-of-type');
    fireEvent.click(updateButton!);

    expect(mockProps.onCommentUpdate).toHaveBeenCalledWith(1, 'Updated text');
  });

  test('handles comment deletion', async () => {
    renderComponent();
    const deleteButton = screen.getByTestId('comment-1').querySelector('button:last-of-type');
    fireEvent.click(deleteButton!);

    expect(mockProps.onCommentDelete).toHaveBeenCalledWith(1);
  });

  test('shows edit dialog when editingComment is provided', () => {
    const propsWithEditingComment: TaskCommentSectionProps = {
      ...mockProps,
      editingComment: mockComments[0]
    };
    renderComponent(propsWithEditingComment);

    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
  });

  test('handles edit dialog close', () => {
    const propsWithEditingComment: TaskCommentSectionProps = {
      ...mockProps,
      editingComment: mockComments[0]
    };
    renderComponent(propsWithEditingComment);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockProps.onEditEnd).toHaveBeenCalled();
  });

  test('handles edit dialog save', () => {
    const propsWithEditingComment: TaskCommentSectionProps = {
      ...mockProps,
      editingComment: mockComments[0]
    };
    renderComponent(propsWithEditingComment);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockProps.onCommentUpdate).toHaveBeenCalledWith(1, 'Updated comment');
  });

  test('passes correct props to CommentList', () => {
    renderComponent();
    const commentList = screen.getByTestId('comment-list');

    expect(commentList).toBeInTheDocument();
    mockComments.forEach(comment => {
      expect(screen.getByTestId(`comment-${comment.id}`)).toHaveTextContent(comment.comment);
    });
  });
});