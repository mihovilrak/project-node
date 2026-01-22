import express, { Application } from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../../db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('../../services/notificationService', () => ({
  notificationService: {
    generateNotification: jest.fn(),
  },
}));

jest.mock('../../middleware/rateLimiter', () => ({
  rateLimiter: (req: any, res: any, next: any) => next(),
}));

jest.mock('../../middleware/validation', () => ({
  validateNotification: (req: any, res: any, next: any) => next(),
}));

import { notificationRoutes } from '../../routes/notifications';
import { pool } from '../../db';
import { notificationService } from '../../services/notificationService';

describe('Notification Routes', () => {
  let app: Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/notifications', notificationRoutes);
  });

  describe('GET /:userId', () => {
    it('should return notifications for a user', async () => {
      const mockNotifications = [
        {
          id: 1,
          user_id: 123,
          type_id: 1,
          title: 'Task Due Soon',
          link: '/tasks/1',
          created_on: new Date().toISOString(),
          type: 'Task Due Soon',
          icon: 'AccessTime',
          color: '#ff9800',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockNotifications });

      const response = await request(app)
        .get('/api/notifications/123')
        .expect(200);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM user_notifications($1)',
        ['123']
      );
      expect(response.body).toEqual(mockNotifications);
    });

    it('should return empty array when no notifications', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/notifications/456')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/notifications/123')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /', () => {
    it('should create a new notification', async () => {
      const mockNotification = {
        id: '456',
        type_id: 1,
        user_id: '123',
        created_on: new Date().toISOString(),
      };

      (notificationService.generateNotification as jest.Mock).mockResolvedValueOnce(
        mockNotification
      );

      const response = await request(app)
        .post('/api/notifications')
        .send({
          type: 'Task Due Soon',
          userId: '123',
          data: { taskId: 1 },
        })
        .expect(201);

      expect(notificationService.generateNotification).toHaveBeenCalledWith(
        'Task Due Soon',
        '123',
        { taskId: 1 }
      );
      expect(response.body).toEqual(mockNotification);
    });

    it('should return 500 on service error', async () => {
      (notificationService.generateNotification as jest.Mock).mockRejectedValueOnce(
        new Error('Service error')
      );

      const response = await request(app)
        .post('/api/notifications')
        .send({
          type: 'Task Due Soon',
          userId: '123',
          data: { taskId: 1 },
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle different notification types', async () => {
      const notificationTypes = [
        'Task Due Soon',
        'Task Assigned',
        'Task Updated',
        'Task Comment',
        'Task Completed',
        'Project Update',
      ];

      for (const type of notificationTypes) {
        const mockNotification = {
          id: '789',
          type_id: notificationTypes.indexOf(type) + 1,
          user_id: '123',
          created_on: new Date().toISOString(),
        };

        (notificationService.generateNotification as jest.Mock).mockResolvedValueOnce(
          mockNotification
        );

        const response = await request(app)
          .post('/api/notifications')
          .send({
            type,
            userId: '123',
            data: { taskId: 1 },
          })
          .expect(201);

        expect(response.body.type_id).toBe(notificationTypes.indexOf(type) + 1);
      }
    });
  });
});
