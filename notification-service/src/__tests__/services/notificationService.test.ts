jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

jest.mock('../../config', () => ({
  config: {
    appBaseUrl: 'https://app.example.com',
    app: { emailEnabled: true },
  },
}));

jest.mock('../../settingsStore', () => ({
  reloadSettings: jest.fn().mockResolvedValue(false),
}));

jest.mock('../../services/emailService', () => ({
  emailService: {
    sendEmailWithRetry: jest.fn(),
    refreshTransport: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('../../metrics', () => ({
  metrics: {
    increment: jest.fn(),
    setProcessingTime: jest.fn(),
  },
}));

import { notificationService } from '../../services/notificationService';
import { pool } from '../../db';
import { config } from '../../config';
import { reloadSettings } from '../../settingsStore';
import { emailService } from '../../services/emailService';
import { metrics } from '../../metrics';
import { logger } from '../../utils/logger';
import { DatabaseNotification } from '../../types/notification-service.types';

const CLAIM_SQL = 'SELECT * FROM get_notifications_for_service($1, $2)';

describe('NotificationService', () => {
  let client: { query: jest.Mock; release: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    config.app.emailEnabled = true;
    client = {
      query: jest.fn().mockResolvedValue({ rows: [{ locked: true }] }),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(client);
  });

  describe('getEmailTemplate', () => {
    it.each([
      ['Task Due Soon', 'taskDueSoon'],
      ['Task Assigned', 'taskAssigned'],
      ['Task Updated', 'taskUpdated'],
      ['Task Comment', 'taskComment'],
      ['Task Completed', 'taskCompleted'],
      ['Project Update', 'projectUpdate'],
      ['Task Created', 'default'],
      ['Added to Project', 'default'],
      ['constructor', 'default'],
    ])('should map %s to %s', (typeName, template) => {
      expect(notificationService.getEmailTemplate(typeName)).toBe(template);
    });
  });

  describe('processNewNotifications', () => {
    const mockNotifications: DatabaseNotification[] = [
      {
        id: '1',
        user_id: '100',
        type_id: 1,
        type_name: 'Task Due Soon',
        title: 'Task Due Soon',
        message: 'Your task is due soon',
        link: '/tasks/1',
        data: null,
        email_attempts: 1,
        created_on: new Date(),
        email: 'user@test.com',
        login: 'testuser',
      },
    ];

    it('should claim a bounded batch through the claim function', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(pool.query).toHaveBeenCalledWith(CLAIM_SQL, [100, 5]);
    });

    it('should hold the advisory lock for the run and release it', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(client.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('pg_try_advisory_lock'),
        expect.any(Array),
      );
      expect(client.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('pg_advisory_unlock'),
        expect.any(Array),
      );
      expect(client.release).toHaveBeenCalledWith();
    });

    it('should skip the run when another instance holds the lock', async () => {
      client.query.mockResolvedValueOnce({ rows: [{ locked: false }] });

      await notificationService.processNewNotifications();

      expect(pool.query).not.toHaveBeenCalled();
      expect(reloadSettings).not.toHaveBeenCalled();
      expect(client.query).toHaveBeenCalledTimes(1);
      expect(client.release).toHaveBeenCalled();
    });

    it('should skip a run that overlaps one still in progress', async () => {
      let finishSend: () => void = () => {};
      (emailService.sendEmailWithRetry as jest.Mock).mockReturnValueOnce(
        new Promise<void>((resolve) => {
          finishSend = resolve;
        }),
      );
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockNotifications })
        .mockResolvedValue({ rows: [] });

      const first = notificationService.processNewNotifications();
      await new Promise((resolve) => setImmediate(resolve));
      await notificationService.processNewNotifications();

      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('still in progress'),
      );

      finishSend();
      await first;

      // The guard is cleared once the first run finishes.
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await notificationService.processNewNotifications();
      expect(pool.connect).toHaveBeenCalledTimes(2);
    });

    it('should destroy the connection when the unlock fails', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      const unlockError = new Error('connection lost');
      client.query
        .mockResolvedValueOnce({ rows: [{ locked: true }] })
        .mockRejectedValueOnce(unlockError);

      await notificationService.processNewNotifications();

      expect(client.release).toHaveBeenCalledWith(unlockError);
    });

    it('should not claim rows while email is disabled', async () => {
      config.app.emailEnabled = false;

      await notificationService.processNewNotifications();

      expect(reloadSettings).toHaveBeenCalled();
      expect(pool.query).not.toHaveBeenCalledWith(
        CLAIM_SQL,
        expect.anything(),
      );
      expect(emailService.sendEmailWithRetry).not.toHaveBeenCalled();
      expect(client.release).toHaveBeenCalled();
    });

    it('should rebuild the transport when SMTP settings changed', async () => {
      (reloadSettings as jest.Mock).mockResolvedValueOnce(true);
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(emailService.refreshTransport).toHaveBeenCalled();
    });

    it('should keep the transport when SMTP settings are unchanged', async () => {
      (reloadSettings as jest.Mock).mockResolvedValueOnce(false);
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(emailService.refreshTransport).not.toHaveBeenCalled();
    });

    it('should send an email for each claimed notification', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockNotifications })
        .mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(emailService.sendEmailWithRetry).toHaveBeenCalledWith(
        'user@test.com',
        'Task Due Soon',
        'taskDueSoon',
        {
          userName: 'testuser',
          taskUrl: 'https://app.example.com/tasks/1',
          title: 'Task Due Soon',
          message: 'Your task is due soon',
          typeName: 'Task Due Soon',
        },
      );
    });

    it('should count sends and record processing time', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockNotifications })
        .mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(metrics.increment).toHaveBeenCalledWith('notificationsSent');
      expect(metrics.setProcessingTime).toHaveBeenCalled();
    });

    it('should mark a sent notification emailed', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockNotifications })
        .mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(pool.query).toHaveBeenLastCalledWith(
        expect.stringContaining('SET emailed_on = NOW()'),
        ['1'],
      );
    });

    it('should keep going when marking one notification fails', async () => {
      const rows = [
        { ...mockNotifications[0], id: '1' },
        { ...mockNotifications[0], id: '2' },
      ];
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows })
        .mockRejectedValueOnce(new Error('DB error'))
        .mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET emailed_on'),
        ['2'],
      );
      expect(metrics.increment).toHaveBeenCalledWith('notificationErrors');
      expect(metrics.increment).toHaveBeenCalledWith('notificationsSent');
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(metrics.setProcessingTime).toHaveBeenCalled();
    });

    it('should not count a failed send as sent', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: mockNotifications,
      });
      (emailService.sendEmailWithRetry as jest.Mock).mockRejectedValueOnce(
        new Error('SMTP down'),
      );

      await notificationService.processNewNotifications();

      expect(metrics.increment).toHaveBeenCalledWith('emailErrors');
      expect(metrics.increment).not.toHaveBeenCalledWith('notificationsSent');
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should dead-letter a notification on its final attempt', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ ...mockNotifications[0], email_attempts: 5 }],
      });
      (emailService.sendEmailWithRetry as jest.Mock).mockRejectedValueOnce(
        new Error('SMTP down'),
      );

      await notificationService.processNewNotifications();

      expect(metrics.increment).toHaveBeenCalledWith(
        'notificationsDeadLettered',
      );
    });

    it('should not dead-letter while attempts remain', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: mockNotifications,
      });
      (emailService.sendEmailWithRetry as jest.Mock).mockRejectedValueOnce(
        new Error('SMTP down'),
      );

      await notificationService.processNewNotifications();

      expect(metrics.increment).not.toHaveBeenCalledWith(
        'notificationsDeadLettered',
      );
    });

    it('should handle a claim failure gracefully', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      await notificationService.processNewNotifications();

      expect(metrics.increment).toHaveBeenCalledWith('notificationErrors');
      expect(client.release).toHaveBeenCalled();
    });

    it('should handle a failure to get a connection', async () => {
      (pool.connect as jest.Mock).mockRejectedValueOnce(
        new Error('pool exhausted'),
      );

      await notificationService.processNewNotifications();

      expect(metrics.increment).toHaveBeenCalledWith('notificationErrors');
    });

    it('should process multiple notifications', async () => {
      const multipleNotifications: DatabaseNotification[] = [
        { ...mockNotifications[0], id: '1' },
        {
          ...mockNotifications[0],
          id: '2',
          email: 'user2@test.com',
          login: 'testuser2',
        },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: multipleNotifications })
        .mockResolvedValue({ rows: [] });

      await notificationService.processNewNotifications();

      expect(emailService.sendEmailWithRetry).toHaveBeenCalledTimes(2);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['1']);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['2']);
    });
  });

  describe('markEmailed', () => {
    it('should count a failed update as a notification error', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      await notificationService.markEmailed('1');

      expect(metrics.increment).toHaveBeenCalledWith('notificationErrors');
    });
  });

  describe('sendNotificationEmail', () => {
    const mockNotification: DatabaseNotification = {
      id: '1',
      user_id: '100',
      type_id: 2,
      type_name: 'Task Assigned',
      title: 'Task Assigned',
      message: 'A task was assigned to you',
      link: '/tasks/5',
      data: null,
      email_attempts: 1,
      created_on: new Date(),
      email: 'assignee@test.com',
      login: 'assigneeuser',
    };

    it('should send the notification with an absolute link', async () => {
      const sent =
        await notificationService.sendNotificationEmail(mockNotification);

      expect(sent).toBe(true);
      expect(emailService.sendEmailWithRetry).toHaveBeenCalledWith(
        'assignee@test.com',
        'Task Assigned',
        'taskAssigned',
        {
          userName: 'assigneeuser',
          taskUrl: 'https://app.example.com/tasks/5',
          title: 'Task Assigned',
          message: 'A task was assigned to you',
          typeName: 'Task Assigned',
        },
      );
    });

    it('should fall back to the base url when there is no link', async () => {
      await notificationService.sendNotificationEmail({
        ...mockNotification,
        link: '',
      });

      expect(emailService.sendEmailWithRetry).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ taskUrl: 'https://app.example.com' }),
      );
    });

    it('should expose the data payload to the template', async () => {
      await notificationService.sendNotificationEmail({
        ...mockNotification,
        data: { taskName: 'Write report', priority: 'High' },
      });

      expect(emailService.sendEmailWithRetry).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ taskName: 'Write report', priority: 'High' }),
      );
    });

    it('should let named fields win over the data payload', async () => {
      await notificationService.sendNotificationEmail({
        ...mockNotification,
        data: { title: 'from data', userName: 'from data' },
      });

      expect(emailService.sendEmailWithRetry).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          title: 'Task Assigned',
          userName: 'assigneeuser',
        }),
      );
    });

    it('should not touch the database', async () => {
      await notificationService.sendNotificationEmail(mockNotification);

      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should report failure and count an email error', async () => {
      (emailService.sendEmailWithRetry as jest.Mock).mockRejectedValueOnce(
        new Error('Email failed'),
      );

      const sent =
        await notificationService.sendNotificationEmail(mockNotification);

      expect(sent).toBe(false);
      expect(metrics.increment).toHaveBeenCalledWith('emailErrors');
    });
  });
});
