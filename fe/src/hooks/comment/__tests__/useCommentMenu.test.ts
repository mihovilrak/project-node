import { renderHook, act } from '@testing-library/react';
import { useCommentMenu } from '../useCommentMenu';
import { Comment } from '../../../types/comment';

describe('useCommentMenu', () => {
  const mockComment: Comment = {
    id: 1,
    comment: 'Test comment',
    created_on: new Date().toISOString(),
    updated_on: new Date().toISOString(),
    task_id: 1,
    user_id: 1,
    active: true
  };

  const mockOnCommentUpdated = jest.fn();
  const mockOnCommentDeleted = jest.fn();

  const createMockMouseEvent = (element: HTMLElement) => {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    Object.defineProperty(event, 'currentTarget', { value: element });
    return event as unknown as React.MouseEvent<HTMLElement>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useCommentMenu(mockOnCommentUpdated, mockOnCommentDeleted)
    );

    expect(result.current.anchorEl).toBeNull();
    expect(result.current.selectedComment).toBeNull();
    expect(result.current.editDialogOpen).toBe(false);
  });

  it('should handle menu open', () => {
    const { result } = renderHook(() =>
      useCommentMenu(mockOnCommentUpdated, mockOnCommentDeleted)
    );

    const button = document.createElement('button');
    const mockEvent = createMockMouseEvent(button);

    act(() => {
      result.current.handleMenuOpen(mockEvent, mockComment);
    });

    expect(result.current.anchorEl).toBe(button);
    expect(result.current.selectedComment).toBe(mockComment);
  });

  it('should handle menu close', () => {
    const { result } = renderHook(() =>
      useCommentMenu(mockOnCommentUpdated, mockOnCommentDeleted)
    );

    // First open the menu
    const button = document.createElement('button');
    const mockEvent = createMockMouseEvent(button);

    act(() => {
      result.current.handleMenuOpen(mockEvent, mockComment);
    });

    // Then close it
    act(() => {
      result.current.handleMenuClose();
    });

    expect(result.current.anchorEl).toBeNull();
    expect(result.current.selectedComment).toBeNull();
  });

  it('should handle edit click', () => {
    const { result } = renderHook(() =>
      useCommentMenu(mockOnCommentUpdated, mockOnCommentDeleted)
    );

    act(() => {
      result.current.handleEditClick();
    });

    expect(result.current.editDialogOpen).toBe(true);
    expect(result.current.anchorEl).toBeNull();
  });

  it('should preserve selectedComment when opening edit dialog so dialog can show and save the comment', () => {
    const { result } = renderHook(() =>
      useCommentMenu(mockOnCommentUpdated, mockOnCommentDeleted)
    );

    const button = document.createElement('button');
    const mockEvent = createMockMouseEvent(button);

    act(() => {
      result.current.handleMenuOpen(mockEvent, mockComment);
    });
    expect(result.current.selectedComment).toBe(mockComment);

    act(() => {
      result.current.handleEditClick();
    });

    expect(result.current.editDialogOpen).toBe(true);
    expect(result.current.anchorEl).toBeNull();
    expect(result.current.selectedComment).toBe(mockComment);
  });

  it('should handle edit close', () => {
    const { result } = renderHook(() =>
      useCommentMenu(mockOnCommentUpdated, mockOnCommentDeleted)
    );

    // First open the edit dialog
    act(() => {
      result.current.handleEditClick();
    });

    // Then close it
    act(() => {
      result.current.handleEditClose();
    });

    expect(result.current.editDialogOpen).toBe(false);
    expect(result.current.selectedComment).toBeNull();
  });

  it('should handle edit save', async () => {
    const { result } = renderHook(() =>
      useCommentMenu(mockOnCommentUpdated, mockOnCommentDeleted)
    );

    await act(async () => {
      await result.current.handleEditSave(1, 'Updated comment');
    });

    expect(mockOnCommentUpdated).toHaveBeenCalledWith(1, 'Updated comment');
    expect(result.current.editDialogOpen).toBe(false);
    expect(result.current.selectedComment).toBeNull();
  });

  it('should handle delete click', async () => {
    const { result } = renderHook(() =>
      useCommentMenu(mockOnCommentUpdated, mockOnCommentDeleted)
    );

    // First set a selected comment
    const button = document.createElement('button');
    const mockEvent = createMockMouseEvent(button);

    act(() => {
      result.current.handleMenuOpen(mockEvent, mockComment);
    });

    // Then delete it
    await act(async () => {
      await result.current.handleDeleteClick();
    });

    expect(mockOnCommentDeleted).toHaveBeenCalledWith(mockComment.id);
    expect(result.current.anchorEl).toBeNull();
    expect(result.current.selectedComment).toBeNull();
  });

  it('should not call delete if no comment is selected', async () => {
    const { result } = renderHook(() =>
      useCommentMenu(mockOnCommentUpdated, mockOnCommentDeleted)
    );

    await act(async () => {
      await result.current.handleDeleteClick();
    });

    expect(mockOnCommentDeleted).not.toHaveBeenCalled();
  });
});
