import { renderHook, act } from '@testing-library/react';
import { useNotificationCenter } from '../useNotificationCenter';
import { getNotifications, markAsRead, deleteNotification } from '../../../api/notifications';
import { MemoryRouter } from 'react-router-dom';

// Mock the API functions
jest.mock('../../../api/notifications', () => ({
  getNotifications: jest.fn(),
  markAsRead: jest.fn(),
  deleteNotification: jest.fn(),
}));

// Mock data
const mockNotifications = [
  {
    id: 1,
    user_id: 1,
    type_id: 1,
    title: 'Test Notification 1',
    message: 'Test Message 1',
    link: '/test-link-1',
    is_read: false,
    created_on: '2025-01-25T16:29:14.000Z',
  },
  {
    id: 2,
    user_id: 1,
    type_id: 2,
    title: 'Test Notification 2',
    message: 'Test Message 2',
    link: null,
    is_read: true,
    created_on: '2025-01-25T16:29:14.000Z',
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useNotificationCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useNotificationCenter(undefined), { wrapper });
    
    expect(result.current.notifications).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.anchorEl).toBe(null);
  });

  it('should fetch notifications when userId is provided', async () => {
    (getNotifications as jest.Mock).mockResolvedValue(mockNotifications);

    const { result } = renderHook(() => useNotificationCenter(1), { wrapper });

    // Wait for the initial fetch
    await act(async () => {
      await jest.runAllTimers();
    });

    expect(getNotifications).toHaveBeenCalledWith(1);
    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(1); // Only one notification is unread
  });

  it('should handle notification click correctly', async () => {
    (getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
    (markAsRead as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotificationCenter(1), { wrapper });

    await act(async () => {
      await result.current.handleNotificationClick(mockNotifications[0]);
    });

    expect(markAsRead).toHaveBeenCalledWith(1);
    expect(getNotifications).toHaveBeenCalledTimes(2); // Initial fetch + after marking as read
  });

  it('should handle notification deletion', async () => {
    (getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
    (deleteNotification as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotificationCenter(1), { wrapper });

    const mockEvent = {
      stopPropagation: jest.fn(),
    } as unknown as React.MouseEvent;

    await act(async () => {
      await result.current.handleDeleteNotification(1, mockEvent);
    });

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(deleteNotification).toHaveBeenCalledWith(1);
    expect(getNotifications).toHaveBeenCalledTimes(2); // Initial fetch + after deletion
  });

  it('should handle anchor element for notification menu', () => {
    const { result } = renderHook(() => useNotificationCenter(1), { wrapper });

    const mockEvent = {
      currentTarget: document.createElement('button'),
    } as React.MouseEvent<HTMLButtonElement>;

    act(() => {
      result.current.handleClick(mockEvent);
    });

    expect(result.current.anchorEl).toBe(mockEvent.currentTarget);

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.anchorEl).toBe(null);
  });

  it('should poll for notifications every minute', async () => {
    (getNotifications as jest.Mock).mockResolvedValue(mockNotifications);

    renderHook(() => useNotificationCenter(1), { wrapper });

    // Initial fetch
    expect(getNotifications).toHaveBeenCalledTimes(1);

    // Advance time by 1 minute
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    // Should fetch again after 1 minute
    expect(getNotifications).toHaveBeenCalledTimes(2);
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getNotifications as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useNotificationCenter(1), { wrapper });

    await act(async () => {
      jest.runAllTimers();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch notifications:', expect.any(Error));
    expect(result.current.notifications).toEqual([]);
    expect(result.current.loading).toBe(false);

    consoleErrorSpy.mockRestore();
  });
});
