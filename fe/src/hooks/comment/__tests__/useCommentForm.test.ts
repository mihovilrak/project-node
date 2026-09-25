import { renderHook, act } from '@testing-library/react';
import { useCommentForm } from '../useCommentForm';

describe('useCommentForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useCommentForm(mockOnSubmit));

    expect(result.current.comment).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update comment when setComment is called', () => {
    const { result } = renderHook(() => useCommentForm(mockOnSubmit));

    act(() => {
      result.current.setComment('New comment');
    });

    expect(result.current.comment).toBe('New comment');
  });

  it('should handle successful comment submission', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useCommentForm(mockOnSubmit));

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
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith('New comment');
    expect(result.current.comment).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should not submit empty comment', async () => {
    const { result } = renderHook(() => useCommentForm(mockOnSubmit));

    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should handle submission error', async () => {
    const mockError = {
      response: { status: 400, data: { error: 'Failed to create comment' } },
    };
    mockOnSubmit.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCommentForm(mockOnSubmit));

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

    expect(result.current.error).toBe('Failed to create comment');
    expect(result.current.loading).toBe(false);
    expect(result.current.comment).toBe('New comment');
  });
});
