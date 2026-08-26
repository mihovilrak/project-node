// Notifications are claimed and emailed outside any transaction, so every
// database call goes through pool.query
jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('../../services/emailService', () => ({
  emailService: {
    sendEmailWithRetry: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
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
    notificationsSent: 0,
    emailErrors: 0,
    notificationErrors: 0,
    notificationsDeadLettered: 0,
  },
}));

import { notificationService } from '../../services/notificationService';
import { pool } from '../../db';
import { emailService } from '../../services/emailService';
import { metrics } from '../../metrics';
import { DatabaseNotification } from '../../types/notification-service.types';

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmailTemplate', () => {
    it('should return taskDueSoon for type_id 1', () => {
      const result = notificationService.getEmailTemplate(1);
      expect(result).toBe('taskDueSoon');
    });

    it('should return taskAssigned for type_id 2', () => {
      const result = notificationService.getEmailTemplate(2);
      expect(result).toBe('taskAssigned');
    });

    it('should return taskUpdated for type_id 3', () => {
      const result = notificationService.getEmailTemplate(3);
      expect(result).toBe('taskUpdated');
    });

    it('should return taskComment for type_id 4', () => {
      const result = notificationService.getEmailTemplate(4);
      expect(result).toBe('taskComment');
    });

    it('should return taskCompleted for type_id 5', () => {
      const result = notificationService.getEmailTemplate(5);
      expect(result).toBe('taskCompleted');
    });

    it('should return projectUpdate for type_id 6', () => {
      const result = notificationService.getEmailTemplate(6);
      expect(result).toBe('projectUpdate');
    });

    it('should return default for unknown type_id', () => {
      const result = notificationService.getEmailTemplate(99);
      expect(result).toBe('default');
    });

    it('should return default for type_id 0', () => {
      const result = notificationService.getEmailTemplate(0);
      expect(result).toBe('default');
    });
  });

  describe('processNewNotifications', () => {
    const mockNotifications: DatabaseNotification[] = [
      {
        id: '1',
        user_id: '100',
        type_id: 1,
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

    it('should claim a batch of notifications', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM get_notifications_for_service($1, $2)',
        [100, 5],
      );
    });

    it('should send email for each notification', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockNotifications })
        .mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(emailService.sendEmailWithRetry).toHaveBeenCalledWith(
        'user@test.com',
        'Task Due Soon',
        'taskDueSoon',
        { userName: 'testuser', taskUrl: '/tasks/1' },
      );
    });

    it('should increment notificationsSent and record processing time', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockNotifications })
        .mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(metrics.increment).toHaveBeenCalledWith('notificationsSent');
      expect(metrics.setProcessingTime).toHaveBeenCalled();
    });

    it('should mark the notification as emailed after sending', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockNotifications })
        .mockResolvedValueOnce({ rows: [] });

      await notificationService.processNewNotifications();

      expect(pool.query).toHaveBeenLastCalledWith(
        expect.stringContaining('SET emailed_on = NOW()'),
        ['1'],
      );
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

    it('should handle errors gracefully', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
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
      expect(metrics.increment).toHaveBeenCalledWith('notificationsSent');
    });
  });

  describe('sendNotificationEmail', () => {
    const mockNotification: DatabaseNotification = {
      id: '1',
      user_id: '100',
      type_id: 2,
      title: 'Task Assigned',
      message: 'A task was assigned to you',
      link: '/tasks/5',
      data: null,
      email_attempts: 1,
      created_on: new Date(),
      email: 'assignee@test.com',
      login: 'assigneeuser',
    };

    it('should send email with correct parameters', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const sent =
        await notificationService.sendNotificationEmail(mockNotification);

      expect(sent).toBe(true);
      expect(emailService.sendEmailWithRetry).toHaveBeenCalledWith(
        'assignee@test.com',
        'Task Assigned',
        'taskAssigned',
        { userName: 'assigneeuser', taskUrl: '/tasks/5' },
      );
    });

    it('should mark notification as emailed', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await notificationService.sendNotificationEmail(mockNotification);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET emailed_on = NOW()'),
        ['1'],
      );
    });

    it('should leave read_on untouched', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await notificationService.sendNotificationEmail(mockNotification);

      expect(pool.query).not.toHaveBeenCalledWith(
        expect.stringContaining('read_on'),
        expect.anything(),
      );
    });

    it('should report failure and increment emailErrors', async () => {
      (emailService.sendEmailWithRetry as jest.Mock).mockRejectedValueOnce(
        new Error('Email failed'),
      );

      const sent =
        await notificationService.sendNotificationEmail(mockNotification);

      expect(sent).toBe(false);
      expect(metrics.increment).toHaveBeenCalledWith('emailErrors');
    });
  });

  describe('generateNotification', () => {
    it('should insert notification into database', async () => {
      const mockResult = {
        rows: [
          {
            id: '123',
            type_id: 1,
            user_id: '456',
            created_on: new Date(),
          },
        ],
      };

      (pool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      const result = await notificationService.generateNotification(
        'Task Due Soon',
        '456',
        { taskId: 1 },
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notifications'),
        ['Task Due Soon', '456', { taskId: 1 }],
      );
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should throw error on database failure', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      await expect(
        notificationService.generateNotification('Task Due Soon', '456', {
          taskId: 1,
        }),
      ).rejects.toThrow('DB error');
    });
  });
});
