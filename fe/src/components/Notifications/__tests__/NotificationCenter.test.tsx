import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
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
    created_on: '2025-01-25T16:29:14.000Z',
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
    created_on: '2025-01-25T16:29:14.000Z',
  },
];

const mockHookReturn = {
  anchorEl: null,
  notifications: mockNotifications,
  loading: false,
  unreadCount: 1,
  handleClick: jest.fn(),
  handleClose: jest.fn(),
  handleNotificationClick: jest.fn(),
  handleDeleteNotification: jest.fn(),
};

describe('NotificationCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNotificationCenter as jest.Mock).mockReturnValue(mockHookReturn);
  });

  const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  it('renders notification button with correct unread count', () => {
    renderWithRouter(<NotificationCenter userId={1} />);
    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useNotificationCenter as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      loading: true,
    });
    renderWithRouter(<NotificationCenter userId={1} />);

    // We don't need to click the button anymore since the loading indicator is always present when loading is true
    expect(screen.getByTestId('loading-state-indicator')).toBeInTheDocument();
  });

  it('keeps the list visible during a background refresh', () => {
    (useNotificationCenter as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      loading: true,
    });
    renderWithRouter(<NotificationCenter userId={1} testMode={true} />);

    expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    (useNotificationCenter as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      notifications: [],
    });
    // Use testMode to render menu content directly
    renderWithRouter(<NotificationCenter userId={1} testMode={true} />);

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('renders View all link to notifications page', () => {
    renderWithRouter(<NotificationCenter userId={1} testMode={true} />);
    const viewAll = screen.getByTestId('view-all-notifications');
    expect(viewAll).toBeInTheDocument();
    expect(viewAll).toHaveAttribute('href', '/notifications');
  });

  it('renders notifications list correctly', () => {
    // Use testMode to render menu content directly
    renderWithRouter(<NotificationCenter userId={1} testMode={true} />);

    expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
    expect(screen.getByText('Test Message 1')).toBeInTheDocument();
    expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
  });

  it('calls handleNotificationClick when notification is clicked', () => {
    // Use testMode to render menu content directly
    renderWithRouter(<NotificationCenter userId={1} testMode={true} />);

    fireEvent.click(screen.getByText('Test Notification 1'));

    expect(mockHookReturn.handleNotificationClick).toHaveBeenCalledWith(
      mockNotifications[0],
    );
  });

  it('calls handleDeleteNotification when delete button is clicked', () => {
    // Use testMode to render menu content directly
    renderWithRouter(<NotificationCenter userId={1} testMode={true} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockHookReturn.handleDeleteNotification).toHaveBeenCalledWith(
      mockNotifications[0].id,
      expect.any(Object),
    );
  });

  it('opens a notification from the keyboard', async () => {
    const user = userEvent.setup();
    renderWithRouter(<NotificationCenter userId={1} testMode={true} />);

    const item = screen.getByRole('button', {
      name: /^Unread: Test Notification 1/,
    });
    item.focus();
    await user.keyboard('{Enter}');
    expect(mockHookReturn.handleNotificationClick).toHaveBeenCalledWith(
      mockNotifications[0],
    );

    screen.getByRole('button', { name: /^Test Notification 2/ }).focus();
    await user.keyboard(' ');
    expect(mockHookReturn.handleNotificationClick).toHaveBeenCalledWith(
      mockNotifications[1],
    );
  });

  it('names each delete button after its notification and marks unread ones', () => {
    renderWithRouter(<NotificationCenter userId={1} testMode={true} />);

    expect(
      screen.getByRole('button', {
        name: 'Delete notification: Test Notification 1',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Unread: Test Notification 1/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Test Notification 2/ }),
    ).toBeInTheDocument();
  });

  it('exposes the popup state on the bell button', async () => {
    const { rerender } = renderWithRouter(<NotificationCenter userId={1} />);
    const bell = screen.getByRole('button', { name: '1 unread notifications' });
    expect(bell).toHaveAttribute('aria-expanded', 'false');
    expect(bell).toHaveAttribute('aria-haspopup', 'dialog');

    (useNotificationCenter as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      anchorEl: bell,
    });
    rerender(
      <MemoryRouter>
        <NotificationCenter userId={1} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', {
        name: '1 unread notifications',
        hidden: true,
      }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      await screen.findByRole('dialog', { name: 'Notifications' }),
    ).toBeInTheDocument();
  });

  it('applies different styles for read and unread notifications', () => {
    // Use testMode to render menu content directly
    renderWithRouter(<NotificationCenter userId={1} testMode={true} />);

    const listItems = screen.getAllByRole('listitem');

    expect(listItems[0]).toHaveStyle({ backgroundColor: 'action.hover' });
    expect(listItems[1]).toHaveStyle({ backgroundColor: 'inherit' });
  });

  it('shows correct icon for different notification types', () => {
    // Use testMode to render menu content directly
    renderWithRouter(<NotificationCenter userId={1} testMode={true} />);

    const listItems = screen.getAllByRole('listitem');

    expect(within(listItems[0]).getByTestId('TaskIcon')).toBeInTheDocument();
    expect(within(listItems[1]).getByTestId('FolderIcon')).toBeInTheDocument();
  });
});
