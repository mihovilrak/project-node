import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../TestWrapper';
import Tasks from '../../components/Tasks/Tasks';
import { api } from '../../api/api';
import { Task } from '../../types/task';
import { Comment } from '../../types/comment';
import { Notification } from '../../types/notification';

// Mock the API calls
jest.mock('../../api/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Comments and Notifications Flow', () => {
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
    type_name: 'Feature',
    status_id: 1,
    status_name: 'To Do',
    priority_id: 1,
    priority_name: 'High',
    start_date: '2025-01-25',
    due_date: '2025-02-25',
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'Test Creator',
    created_on: '2025-01-25',
    estimated_time: 8
  };

  const mockComment: Comment = {
    id: 1,
    task_id: 1,
    comment: 'Test comment',
    user_id: 1,
    user_name: 'Test User',
    created_on: '2025-01-25',
    updated_on: '2025-01-25',
    active: true
  };

  const mockNotification: Notification = {
    id: 1,
    user_id: 2,
    type_id: 1,
    title: 'New Comment',
    message: 'Test User commented on Test Task',
    link: '/tasks/1',
    is_read: false,
    created_on: '2025-01-25',
    type_name: 'Comment',
    type_color: 'blue',
    type_icon: 'comment'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock initial API responses
    mockedApi.get.mockImplementation((url: string) => {
      if (url.includes('/tasks/1')) {
        return Promise.resolve({ data: mockTask });
      }
      if (url.includes('/tasks/1/comments')) {
        return Promise.resolve({ data: [mockComment] });
      }
      if (url.includes('/notifications/2')) {
        return Promise.resolve({ data: [mockNotification] });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('should create, edit, and delete comments', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock comment creation
    mockedApi.post.mockResolvedValueOnce({ data: mockComment });

    // Create comment
    await user.click(screen.getByTestId('add-comment-button'));
    await user.type(screen.getByTestId('comment-input'), 'Test comment');
    await user.click(screen.getByTestId('submit-comment-button'));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/tasks/1/comments', {
        comment: 'Test comment'
      });
    });

    // Mock comment edit
    const editedComment = { ...mockComment, comment: 'Edited comment' };
    mockedApi.put.mockResolvedValueOnce({ data: editedComment });

    // Edit comment
    await user.click(screen.getByTestId('edit-comment-button-1'));
    await user.clear(screen.getByTestId('edit-comment-input'));
    await user.type(screen.getByTestId('edit-comment-input'), 'Edited comment');
    await user.click(screen.getByTestId('save-comment-button'));

    await waitFor(() => {
      expect(mockedApi.put).toHaveBeenCalledWith('/tasks/1/comments/1', {
        comment: 'Edited comment'
      });
    });

    // Mock comment deletion
    mockedApi.delete.mockResolvedValueOnce({});

    // Delete comment
    await user.click(screen.getByTestId('delete-comment-button-1'));
    await user.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith('/tasks/1/comments/1');
    });
  });

  it('should handle notifications and marking them as read', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Open notifications
    await user.click(screen.getByTestId('notifications-button'));

    // Verify notification content
    expect(screen.getByText('New Comment')).toBeInTheDocument();
    expect(screen.getByText('Test User commented on Test Task')).toBeInTheDocument();

    // Mock marking notifications as read
    mockedApi.patch.mockResolvedValueOnce({});

    // Mark notifications as read
    await user.click(screen.getByTestId('mark-read-button'));

    await waitFor(() => {
      expect(mockedApi.patch).toHaveBeenCalledWith('/notifications/2');
    });

    // Mock notification deletion
    mockedApi.delete.mockResolvedValueOnce({});

    // Delete notification
    await user.click(screen.getByTestId('delete-notification-button-1'));

    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith('/notifications/1');
    });
  });

  it('should handle notification filtering', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Open notifications
    await user.click(screen.getByTestId('notifications-button'));

    // Filter by unread
    await user.click(screen.getByTestId('filter-unread-button'));
    expect(screen.getByText('New Comment')).toBeInTheDocument();

    // Filter by read
    await user.click(screen.getByTestId('filter-read-button'));
    expect(screen.queryByText('New Comment')).not.toBeInTheDocument();

    // Clear filters
    await user.click(screen.getByTestId('clear-filters-button'));
    expect(screen.getByText('New Comment')).toBeInTheDocument();
  });

  it('should handle error cases', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Tasks />
      </TestWrapper>
    );

    // Mock comment creation error
    mockedApi.post.mockRejectedValueOnce(new Error('Failed to create comment'));

    // Attempt to create comment
    await user.click(screen.getByTestId('add-comment-button'));
    await user.type(screen.getByTestId('comment-input'), 'Test comment');
    await user.click(screen.getByTestId('submit-comment-button'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create comment')).toBeInTheDocument();
    });

    // Mock notification error
    mockedApi.get.mockRejectedValueOnce(new Error('Failed to fetch notifications'));

    // Attempt to open notifications
    await user.click(screen.getByTestId('notifications-button'));

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch notifications')).toBeInTheDocument();
    });
  });
});
