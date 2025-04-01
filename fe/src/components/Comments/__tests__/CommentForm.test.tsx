import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentForm from '../CommentForm';
import { createComment } from '../../../api/comments';

jest.mock('../../../api/comments');

const mockOnCommentAdded = jest.fn();

describe('CommentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createComment as jest.Mock).mockResolvedValue({
      id: 1,
      taskId: 1,
      comment: 'Test comment',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('renders comment input field', () => {
    render(<CommentForm taskId={1} onCommentAdded={mockOnCommentAdded} />);
    expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
  });

  it('disables submit button when input is empty', () => {
    render(<CommentForm taskId={1} onCommentAdded={mockOnCommentAdded} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables submit button when input has text', async () => {
    render(<CommentForm taskId={1} onCommentAdded={mockOnCommentAdded} />);
    await userEvent.type(screen.getByPlaceholderText('Add a comment...'), 'Test comment');
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('calls onCommentAdded when form is submitted', async () => {
    render(<CommentForm taskId={1} onCommentAdded={mockOnCommentAdded} />);
    await userEvent.type(screen.getByPlaceholderText('Add a comment...'), 'Test comment');
    await userEvent.click(screen.getByRole('button'));
    expect(mockOnCommentAdded).toHaveBeenCalled();
  });
});