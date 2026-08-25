import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationsPage from '../NotificationsPage';
import { useAuth } from '../../../context/AuthContext';
import { useNotificationCenter } from '../../../hooks/notification/useNotificationCenter';

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../../hooks/notification/useNotificationCenter', () => ({
  useNotificationCenter: jest.fn()
}));

const mockHandleNotificationClick = jest.fn();
const mockHandleDeleteNotification = jest.fn();
const mockHandleMarkAllAsRead = jest.fn();
const mockFetchNotifications = jest.fn();

const mockNotifications = [
  {
    id: 1,
    user_id: 1,
    type_id: 1,
    title: 'Task assigned',
    message: 'You were assigned to a task',
    link: '/tasks/1',
    is_read: false,
    active: true,
    read_on: null,
    created_on: '2025-01-01T00:00:00.000Z',
    type_name: 'task'
  }
];

const defaultHookReturn = {
  notifications: mockNotifications,
  loading: false,
  unreadCount: 1,
  handleNotificationClick: mockHandleNotificationClick,
  handleDeleteNotification: mockHandleDeleteNotification,
  handleMarkAllAsRead: mockHandleMarkAllAsRead,
  fetchNotifications: mockFetchNotifications
};

describe('NotificationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ currentUser: { id: 1, login: 'user' } });
    (useNotificationCenter as jest.Mock).mockReturnValue(defaultHookReturn);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    );

  it('renders page title and tabs', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Read' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Unread' })).toBeInTheDocument();
  });

  it('shows Mark all as read when there are unread notifications', () => {
    renderPage();
    expect(screen.getByTestId('mark-all-read')).toBeInTheDocument();
  });

  it('hides Mark all as read when no unread notifications', () => {
    (useNotificationCenter as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      unreadCount: 0
    });
    renderPage();
    expect(screen.queryByTestId('mark-all-read')).not.toBeInTheDocument();
  });

  it('shows sign in message when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ currentUser: null });
    renderPage();
    expect(screen.getByText(/Sign in to view notifications/i)).toBeInTheDocument();
  });

  it('renders notification list', () => {
    renderPage();
    expect(screen.getByText('Task assigned')).toBeInTheDocument();
    expect(screen.getByText('You were assigned to a task')).toBeInTheDocument();
  });

  it('calls handleMarkAllAsRead when Mark all as read is clicked', async () => {
    mockHandleMarkAllAsRead.mockResolvedValue(undefined);
    mockFetchNotifications.mockResolvedValue(undefined);
    renderPage();
    fireEvent.click(screen.getByTestId('mark-all-read'));
    await screen.findByTestId('mark-all-read');
    expect(mockHandleMarkAllAsRead).toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    (useNotificationCenter as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      loading: true
    });
    renderPage();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
