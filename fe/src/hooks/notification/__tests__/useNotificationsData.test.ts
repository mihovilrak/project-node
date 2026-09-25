import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotificationsData } from '../useNotificationsData';
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from '../../../api/notifications';

jest.mock('../../../api/notifications');

const notifications = [
  { id: 1, title: 'A', is_read: false },
  { id: 2, title: 'B', is_read: true },
];

describe('useNotificationsData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getNotifications as jest.Mock).mockResolvedValue(notifications);
    (markAsRead as jest.Mock).mockResolvedValue(undefined);
    (deleteNotification as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not load without a user', () => {
    const { result } = renderHook(() => useNotificationsData(undefined));

    expect(getNotifications).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('loads once and counts unread notifications', async () => {
    const { result } = renderHook(() => useNotificationsData(1, 0));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.unreadCount).toBe(1);
    expect(getNotifications).toHaveBeenCalledTimes(1);
  });

  it('polls on the interval', async () => {
    jest.useFakeTimers();
    renderHook(() => useNotificationsData(1, 1000));
    expect(getNotifications).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(getNotifications).toHaveBeenCalledTimes(2);
  });

  it('marks all as read with a single request', async () => {
    const { result } = renderHook(() => useNotificationsData(1, 0));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAllRead();
    });

    expect(markAsRead).toHaveBeenCalledTimes(1);
    expect(markAsRead).toHaveBeenCalledWith();
    expect(getNotifications).toHaveBeenCalledTimes(2);
  });

  it('treats a 404 on delete as already deleted', async () => {
    (deleteNotification as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404, data: {} },
    });
    const { result } = renderHook(() => useNotificationsData(1, 0));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeNotification(1);
    });

    expect(deleteNotification).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
    expect(getNotifications).toHaveBeenCalledTimes(2);
  });

  it('shows the API message when a delete fails', async () => {
    (deleteNotification as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 403, data: {} },
    });
    const { result } = renderHook(() => useNotificationsData(1, 0));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeNotification(1);
    });

    expect(result.current.error).toBe(
      'You do not have permission to perform this action',
    );
    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });
});
