import { renderHook, act } from '@testing-library/react';
import { useCommentForm } from '../useCommentForm';
import { createComment } from '../../../api/comments';
import { Comment } from '../../../types/comment';

// Mock the createComment API function
jest.mock('../../../api/comments');
const mockedCreateComment = createComment as jest.MockedFunction<typeof createComment>;

describe('useCommentForm', () => {
  const mockTaskId = 1;
  const mockNewComment: Comment = {
    id: 1,
    comment: 'New test comment',
    created_on: new Date().toISOString(),
    updated_on: new Date().toISOString(),
    task_id: mockTaskId,
    user_id: 1,
    active: true
  };

  const mockOnCommentAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useCommentForm(mockTaskId, mockOnCommentAdded));

    expect(result.current.comment).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update comment when setComment is called', () => {
    const { result } = renderHook(() => useCommentForm(mockTaskId, mockOnCommentAdded));

    act(() => {
      result.current.setComment('New comment');
    });

    expect(result.current.comment).toBe('New comment');
  });

  it('should handle successful comment submission', async () => {
    mockedCreateComment.mockResolvedValueOnce(mockNewComment);
    const { result } = renderHook(() => useCommentForm(mockTaskId, mockOnCommentAdded));

    // Set up form data
    act(() => {
      result.current.setComment('New comment');
    });

    // Submit form
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockedCreateComment).toHaveBeenCalledWith(mockTaskId, {
      comment: 'New comment'
    });
    expect(mockOnCommentAdded).toHaveBeenCalledWith(mockNewComment);
    expect(result.current.comment).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should not submit empty comment', async () => {
    const { result } = renderHook(() => useCommentForm(mockTaskId, mockOnCommentAdded));

    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockedCreateComment).not.toHaveBeenCalled();
  });

  it('should handle submission error', async () => {
    const mockError = { error: 'Failed to create comment' };
    mockedCreateComment.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCommentForm(mockTaskId, mockOnCommentAdded));

    // Set up form data
    act(() => {
      result.current.setComment('New comment');
    });

    // Submit form
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toBe(mockError.error);
    expect(result.current.loading).toBe(false);
    expect(mockOnCommentAdded).not.toHaveBeenCalled();
  });
});
