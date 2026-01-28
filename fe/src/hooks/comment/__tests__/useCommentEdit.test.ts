import { renderHook, act } from '@testing-library/react';
import { useCommentEdit } from '../useCommentEdit';
import { Comment } from '../../../types/comment';

describe('useCommentEdit', () => {
  const mockComment: Comment = {
    id: 1,
    comment: 'Test comment',
    created_on: new Date().toISOString(),
    updated_on: new Date().toISOString(),
    task_id: 1,
    user_id: 1,
    active: true
  };

  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state when no comment provided', () => {
    const { result } = renderHook(() => useCommentEdit(null, mockOnSave));

    expect(result.current.editedText).toBe('');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('should initialize with comment text when comment provided', () => {
    const { result } = renderHook(() => useCommentEdit(mockComment, mockOnSave));

    expect(result.current.editedText).toBe(mockComment.comment);
  });

  it('should update editedText when setEditedText is called', () => {
    const { result } = renderHook(() => useCommentEdit(mockComment, mockOnSave));

    act(() => {
      result.current.setEditedText('Updated text');
    });

    expect(result.current.editedText).toBe('Updated text');
  });

  it('should handle successful save', async () => {
    const { result } = renderHook(() => useCommentEdit(mockComment, mockOnSave));

    act(() => {
      result.current.setEditedText('Updated text');
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockOnSave).toHaveBeenCalledWith(mockComment.id, 'Updated text');
    // Note: editedText is not cleared after save - the dialog close handler should do it
    // This allows the dialog to stay open with the edited text if needed
    expect(result.current.editedText).toBe('Updated text');
    expect(result.current.error).toBe('');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle save error', async () => {
    const mockError = new Error('Failed to save');
    const mockOnSaveError = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useCommentEdit(mockComment, mockOnSaveError));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.error).toBe(mockError.message);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should reset form when resetForm is called', () => {
    const { result } = renderHook(() => useCommentEdit(mockComment, mockOnSave));

    act(() => {
      result.current.setEditedText('Updated text');
      result.current.resetForm();
    });

    expect(result.current.editedText).toBe('');
    expect(result.current.error).toBe('');
  });
});
