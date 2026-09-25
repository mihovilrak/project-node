import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationPreferences from '../NotificationPreferences';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../../../api/settings';

jest.mock('../../../api/settings');

const mockGet = getNotificationPreferences as jest.MockedFunction<
  typeof getNotificationPreferences
>;
const mockUpdate = updateNotificationPreferences as jest.MockedFunction<
  typeof updateNotificationPreferences
>;

const inApp = () => screen.getByRole('switch', { name: 'Notifications' });
const email = () => screen.getByRole('switch', { name: 'Email notifications' });

describe('NotificationPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({
      notifications_enabled: true,
      email_notifications_enabled: true,
    });
  });

  it('shows the stored preferences', async () => {
    mockGet.mockResolvedValueOnce({
      notifications_enabled: true,
      email_notifications_enabled: false,
    });
    render(<NotificationPreferences />);

    await waitFor(() => expect(inApp()).toBeEnabled());
    expect(inApp()).toBeChecked();
    expect(email()).not.toBeChecked();
  });

  it('saves a single preference', async () => {
    mockUpdate.mockResolvedValueOnce({
      notifications_enabled: true,
      email_notifications_enabled: false,
    });
    render(<NotificationPreferences />);
    await waitFor(() => expect(email()).toBeEnabled());

    fireEvent.click(email());

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        email_notifications_enabled: false,
      }),
    );
    await waitFor(() => expect(email()).not.toBeChecked());
  });

  it('disables email when notifications are off', async () => {
    mockGet.mockResolvedValueOnce({
      notifications_enabled: false,
      email_notifications_enabled: true,
    });
    render(<NotificationPreferences />);

    await waitFor(() => expect(inApp()).toBeEnabled());
    expect(inApp()).not.toBeChecked();
    expect(email()).toBeDisabled();
    expect(email()).not.toBeChecked();
    expect(
      screen.getByText('Turn on notifications to receive them by email.'),
    ).toBeInTheDocument();
  });

  it('reverts and shows an error when saving fails', async () => {
    mockUpdate.mockRejectedValueOnce({
      response: { data: { error: 'Invalid settings' } },
    });
    render(<NotificationPreferences />);
    await waitFor(() => expect(inApp()).toBeEnabled());

    fireEvent.click(inApp());

    expect(await screen.findByText('Invalid settings')).toBeInTheDocument();
    expect(inApp()).toBeChecked();
  });

  it('shows a load error', async () => {
    mockGet.mockRejectedValueOnce({ response: { status: 500 } });
    render(<NotificationPreferences />);

    expect(
      await screen.findByText('Failed to load notification preferences'),
    ).toBeInTheDocument();
    expect(inApp()).toBeDisabled();
  });
});
