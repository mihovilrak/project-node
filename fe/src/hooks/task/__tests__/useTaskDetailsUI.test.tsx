import { renderHook, act } from '@testing-library/react';
import { useTaskDetailsUI } from '../useTaskDetailsUI';
import { Task } from '../../../types/task';
import { Comment } from '../../../types/comment';
import { TimeLog } from '../../../types/timeLog';
import { TaskFile } from '../../../types/file';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

describe('useTaskDetailsUI', () => {
  const mockTask: Task = {
    id: 1,
    project_id: 1,
    project_name: 'Test Project',
    parent_id: null,
    parent_name: null,
    assignee_id: 1,
    assignee_name: 'Test User',
    holder_id: 1,
    holder_name: 'Test User',
    name: 'Test Task',
    description: 'Test Description',
    type_id: 1,
    type_name: 'Task',
    type_color: '#FF0000',
    status_id: 1,
    status_name: 'To Do',
    priority_id: 1,
    priority_name: 'High',
    priority_color: '#FF0000',
    start_date: '2024-01-25T00:00:00Z',
    due_date: '2024-02-25T00:00:00Z',
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2024-01-25T00:00:00Z',
    estimated_time: 8
  };

  const mockSubtasks: Task[] = [
    {
      id: 2,
      project_id: 1,
      project_name: 'Test Project',
      parent_id: 1,
      parent_name: 'Test Task',
      assignee_id: 1,
      assignee_name: 'Test User',
      holder_id: 1,
      holder_name: 'Test User',
      name: 'Subtask 1',
      description: 'Subtask Description 1',
      type_id: 1,
      type_name: 'Task',
      type_color: '#FF0000',
      status_id: 1,
      status_name: 'To Do',
      priority_id: 1,
      priority_name: 'High',
      priority_color: '#FF0000',
      start_date: '2024-01-25T00:00:00Z',
      due_date: '2024-02-25T00:00:00Z',
      end_date: null,
      spent_time: 0,
      progress: 0,
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-25T00:00:00Z',
      estimated_time: 4
    }
  ];

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
    relatedTarget: null
  } as unknown as React.MouseEvent<HTMLElement>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle status menu click and close', () => {
    const { result } = renderHook(() => useTaskDetailsUI());

    act(() => {
      result.current.handleStatusMenuClick(mockEvent);
    });

    expect(result.current.statusMenuAnchor).toBe(mockEvent.currentTarget);

    act(() => {
      result.current.handleStatusMenuClose();
    });

    expect(result.current.statusMenuAnchor).toBeNull();
  });

  it('should handle navigation to add subtask', () => {
    const { result } = renderHook(() => useTaskDetailsUI());

    act(() => {
      result.current.handleAddSubtask(mockTask);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/tasks/new?projectId=1&parentTaskId=1');
  });

  it('should handle subtask updates', () => {
    const { result } = renderHook(() => useTaskDetailsUI());
    const updatedSubtask = { ...mockSubtasks[0], title: 'Updated Subtask' };

    const updatedSubtasks = result.current.handleSubtaskUpdated(mockSubtasks, 2, updatedSubtask);

    expect(updatedSubtasks).toEqual([updatedSubtask]);
  });

  it('should handle subtask deletion', () => {
    const { result } = renderHook(() => useTaskDetailsUI());

    const remainingSubtasks = result.current.handleSubtaskDeleted(mockSubtasks, 2);

    expect(remainingSubtasks).toEqual([]);
  });

  it('should handle file upload', () => {
    const { result } = renderHook(() => useTaskDetailsUI());
    const mockFiles: TaskFile[] = [];
    const newFile: TaskFile = {
      id: 1,
      task_id: 1,
      user_id: 1,
      name: 'test.txt',
      original_name: 'test.txt',
      mime_type: 'text/plain',
      size: 1024,
      uploaded_on: '2024-01-25T00:00:00Z',
      uploaded_by: 'Test User'
    };

    const updatedFiles = result.current.handleFileUploaded(mockFiles, newFile);

    expect(updatedFiles).toEqual([newFile]);
  });

  it('should handle time log dialog', () => {
    const { result } = renderHook(() => useTaskDetailsUI());
    const mockTimeLog: TimeLog = {
      id: 1,
      task_id: 1,
      user_id: 1,
      activity_type_id: 1,
      log_date: '2024-01-25T00:00:00Z',
      spent_time: 2,
      description: 'Test time log',
      created_on: '2024-01-25T00:00:00Z',
      updated_on: null,
      task_name: 'Test Task',
      project_name: 'Test Project',
      user: 'Test User',
      activity_type_name: 'Development',
      activity_type_color: '#FF0000',
      activity_type_icon: 'code'
    };

    act(() => {
      result.current.handleTimeLogEdit(mockTimeLog);
    });

    expect(result.current.timeLogDialogOpen).toBe(true);
    expect(result.current.selectedTimeLog).toBe(mockTimeLog);

    act(() => {
      result.current.handleTimeLogDialogClose();
    });

    expect(result.current.timeLogDialogOpen).toBe(false);
    expect(result.current.selectedTimeLog).toBeNull();
  });

  it('should handle watcher dialog', () => {
    const { result } = renderHook(() => useTaskDetailsUI());

    act(() => {
      result.current.setWatcherDialogOpen(true);
    });

    expect(result.current.watcherDialogOpen).toBe(true);

    act(() => {
      result.current.setWatcherDialogOpen(false);
    });

    expect(result.current.watcherDialogOpen).toBe(false);
  });

  it('should handle comment editing', () => {
    const { result } = renderHook(() => useTaskDetailsUI());
    const mockComment: Comment = {
      id: 1,
      task_id: 1,
      user_id: 1,
      comment: 'Test comment',
      active: true,
      created_on: '2024-01-25T00:00:00Z',
      updated_on: null,
      user_name: 'Test User'
    };

    act(() => {
      result.current.setEditingComment(mockComment);
    });

    expect(result.current.editingComment).toBe(mockComment);

    act(() => {
      result.current.setEditingComment(null);
    });

    expect(result.current.editingComment).toBeNull();
  });
});
