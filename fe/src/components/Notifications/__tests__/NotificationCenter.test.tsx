import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import NotificationCenter from '../NotificationCenter';
import { useNotificationCenter } from '../../../hooks/notification/useNotificationCenter';
import { Notification } from '../../../types/notification';

// Mock the hook
jest.mock('../../../hooks/notification/useNotificationCenter');

const mockNotifications: Notification[] = [
  {
    id: 1,
    user_id: 1,
    type_id: 1,
    link: '/test-link-1',
    active: true,
    read_on: null,
    title: 'Test Notification 1',
    message: 'Test Message 1',
    type_name: 'task',
    is_read: false,
    created_on: '2025-01-25T16:29:14.000Z'
  },
  {
    id: 2,
    type_id: 2,
    user_id: 1,
    read_on: '2025-01-25T16:29:14.000Z',
    link: '/test-link-2',
    active: true,
    title: 'Test Notification 2',
    message: 'Test Message 2',
    type_name: 'project',
    is_read: true,
    created_on: '2025-01-25T16:29:14.000Z'
  }
];

const mockHookReturn = {
  anchorEl: null,
  notifications: mockNotifications,
  loading: false,
  unreadCount: 1,
  handleClick: jest.fn(),
  handleClose: jest.fn(),
  handleNotificationClick: jest.fn(),
  handleDeleteNotification: jest.fn()
};

describe('NotificationCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNotificationCenter as jest.Mock).mockReturnValue(mockHookReturn);
  });

  it('renders notification button with correct unread count', () => {
    render(<NotificationCenter userId={1} />);
    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useNotificationCenter as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      loading: true
    });
    render(<NotificationCenter userId={1} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    (useNotificationCenter as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      notifications: []
    });
    render(<NotificationCenter userId={1} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('renders notifications list correctly', () => {
    render(<NotificationCenter userId={1} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
    expect(screen.getByText('Test Message 1')).toBeInTheDocument();
    expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
  });

  it('calls handleNotificationClick when notification is clicked', () => {
    render(<NotificationCenter userId={1} />);
    
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Test Notification 1'));
    
    expect(mockHookReturn.handleNotificationClick).toHaveBeenCalledWith(mockNotifications[0]);
  });

  it('calls handleDeleteNotification when delete button is clicked', () => {
    render(<NotificationCenter userId={1} />);
    
    fireEvent.click(screen.getByRole('button'));
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(mockHookReturn.handleDeleteNotification).toHaveBeenCalledWith(
      mockNotifications[0].id,
      expect.any(Object)
    );
  });

  it('applies different styles for read and unread notifications', () => {
    render(<NotificationCenter userId={1} />);
    
    fireEvent.click(screen.getByRole('button'));
    const listItems = screen.getAllByRole('listitem');
    
    expect(listItems[0]).toHaveStyle({ backgroundColor: 'inherit' });
    expect(listItems[1]).not.toHaveStyle({ backgroundColor: 'inherit' });
  });

  it('shows correct icon for different notification types', () => {
    render(<NotificationCenter userId={1} />);
    
    fireEvent.click(screen.getByRole('button'));
    const listItems = screen.getAllByRole('listitem');
    
    expect(within(listItems[0]).getByTestId('TaskIcon')).toBeInTheDocument();
    expect(within(listItems[1]).getByTestId('FolderIcon')).toBeInTheDocument();
  });
});