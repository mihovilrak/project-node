import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentEditDialog from '../CommentEditDialog';
import { useCommentEdit } from '../../../hooks/comment/useCommentEdit';

// Mock the custom hook
jest.mock('../../../hooks/comment/useCommentEdit');

const mockComment = {
  id: 1,
  task_id: 1,
  comment: 'Test comment',
  user_id: 1,
  active: true,
  created_on: '2024-01-01T00:00:00Z',
  updated_on: null
};

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

describe('CommentEditDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCommentEdit as jest.Mock).mockReturnValue({
      editedText: 'Test comment',
      setEditedText: jest.fn(),
      isSubmitting: false,
      error: null,
      handleSave: jest.fn(),
      resetForm: jest.fn()
    });
  });

  it('renders dialog when open', () => {
    render(
      <CommentEditDialog
        open={true}
        comment={mockComment}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Comment')).toBeInTheDocument();
  });

  it('handles text editing', async () => {
    const mockSetEditedText = jest.fn();
    (useCommentEdit as jest.Mock).mockReturnValue({
      editedText: 'Test comment',
      setEditedText: mockSetEditedText,
      isSubmitting: false,
      error: null,
      handleSave: jest.fn(),
      resetForm: jest.fn()
    });

    render(
      <CommentEditDialog
        open={true}
        comment={mockComment}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, ' updated');
    expect(mockSetEditedText).toHaveBeenCalled();
  });

  it('handles Ctrl+Enter shortcut', async () => {
    const mockHandleSave = jest.fn();
    (useCommentEdit as jest.Mock).mockReturnValue({
      editedText: 'Test comment',
      setEditedText: jest.fn(),
      isSubmitting: false,
      error: null,
      handleSave: mockHandleSave,
      resetForm: jest.fn()
    });

    render(
      <CommentEditDialog
        open={true}
        comment={mockComment}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    expect(mockHandleSave).toHaveBeenCalled();
  });

  it('shows loading state when submitting', () => {
    (useCommentEdit as jest.Mock).mockReturnValue({
      editedText: 'Test comment',
      setEditedText: jest.fn(),
      isSubmitting: true,
      error: null,
      handleSave: jest.fn(),
      resetForm: jest.fn()
    });

    render(
      <CommentEditDialog
        open={true}
        comment={mockComment}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('displays error message when error occurs', () => {
    (useCommentEdit as jest.Mock).mockReturnValue({
      editedText: 'Test comment',
      setEditedText: jest.fn(),
      isSubmitting: false,
      error: 'Error saving comment',
      handleSave: jest.fn(),
      resetForm: jest.fn()
    });

    render(
      <CommentEditDialog
        open={true}
        comment={mockComment}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Error saving comment')).toBeInTheDocument();
  });
});