import { renderHook, act } from '@testing-library/react';
import { useTaskDetailsHandlers } from '../useTaskDetailsHandlers';
import { Comment } from '../../../types/comment';
import { TimeLog } from '../../../types/timeLog';

describe('useTaskDetailsHandlers', () => {
  const mockComment: Comment = {
    id: 1,
    task_id: 1,
    user_id: 1,
    comment: 'Test comment',
    active: true,
    created_on: '2024-01-25T00:00:00Z',
    updated_on: null,
    user_name: 'Test User',
  };

  const mockEvent = {
    currentTarget: document.createElement('button'),
    preventDefault: () => {},
    stopPropagation: () => {},
    nativeEvent: new MouseEvent('click'),
    target: document.createElement('button'),
    bubbles: true,
    cancelable: true,
    button: 0,
    buttons: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    screenX: 0,
    screenY: 0,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
    type: 'click',
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    persist: () => {},
    timeStamp: Date.now(),
    getModifierState: () => false,
    movementX: 0,
    movementY: 0,
    relatedTarget: null,
  } as unknown as React.MouseEvent<HTMLElement>;

  it('should handle status menu click and close', () => {
    const { result } = renderHook(() => useTaskDetailsHandlers());

    act(() => {
      result.current.handleStatusMenuClick(mockEvent);
    });

    expect(result.current.state.statusMenuAnchor).toBe(mockEvent.currentTarget);

    act(() => {
      result.current.handleStatusMenuClose();
    });

    expect(result.current.state.statusMenuAnchor).toBeNull();
  });

  it('should handle comment editing', () => {
    const { result } = renderHook(() => useTaskDetailsHandlers());

    act(() => {
      result.current.handleEditStart(mockComment);
    });

    expect(result.current.state.editingComment).toBe(mockComment);

    act(() => {
      result.current.handleEditStart(null);
    });

    expect(result.current.state.editingComment).toBeNull();
  });

  it('should handle time log dialog', async () => {
    const mockTimeLog: TimeLog = {
      id: 1,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-25',
      spent_time: 2,
      description: 'Test time log',
      created_on: '2024-01-25T00:00:00Z',
      updated_on: null,
      activity_type_name: 'Development',
    };
    const { result } = renderHook(() => useTaskDetailsHandlers());

    // Open dialog
    act(() => {
      result.current.handleTimeLogEdit(mockTimeLog);
    });

    expect(result.current.state.timeLogDialogOpen).toBe(true);
    expect(result.current.state.selectedTimeLog).toBe(mockTimeLog);

    // Close dialog
    act(() => {
      result.current.handleTimeLogDialogClose();
    });

    expect(result.current.state.timeLogDialogOpen).toBe(false);
    expect(result.current.state.selectedTimeLog).toBeNull();

    act(() => {
      result.current.handleTimeLogEdit(mockTimeLog);
    });
    act(() => {
      result.current.handleTimeLogCreate();
    });

    expect(result.current.state.timeLogDialogOpen).toBe(true);
    expect(result.current.state.selectedTimeLog).toBeNull();
  });

  it('should handle watcher dialog', () => {
    const { result } = renderHook(() => useTaskDetailsHandlers());

    act(() => {
      result.current.handleWatcherDialogOpen();
    });

    expect(result.current.state.watcherDialogOpen).toBe(true);

    act(() => {
      result.current.handleWatcherDialogClose();
    });

    expect(result.current.state.watcherDialogOpen).toBe(false);
  });
});
