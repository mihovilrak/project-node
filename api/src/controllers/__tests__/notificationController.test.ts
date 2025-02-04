import { Request, Response } from 'express';
import { Pool } from 'pg';
import { jest } from '@jest/globals';
import * as notificationModel from '../../models/notificationModel';
import {
  getUserNotifications,
  markAsRead,
  deleteNotification
} from '../notificationController';
import { NotificationWithDetails, Notification } from '../../types/notification';
import { Session, SessionData } from 'express-session';

// Mock the notification model
jest.mock('../../models/notificationModel');

describe('Notification Controller', () => {
  let mockPool: Pool;
  let mockRequest: Partial<Request>;
  let mockResponse: Response;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock pool
    mockPool = {} as Pool;

    // Create mock response
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response;

    // Create mock request
    mockRequest = {
      params: {},
      session: createMockSession()
    };
  });

  // Helper function to create mock session
  const createMockSession = (withUser = true): Session & Partial<SessionData> => {
    const session = {
      id: 'test-session',
      cookie: {
        originalMaxAge: null,
      },
      ...(withUser && {
        user: {
          id: '1',
          login: 'testuser',
          role_id: 1
        }
      })
    } as Session & Partial<SessionData>;

    session.regenerate = (callback: (err: any) => void) => {
      callback(null);
      return session;
    };
    session.destroy = (callback: (err: any) => void) => {
      callback(null);
      return session;
    };
    session.reload = (callback: (err: any) => void) => {
      callback(null);
      return session;
    };
    session.resetMaxAge = () => {
      return session;
    };
    session.save = (callback?: (err: any) => void) => {
      if (callback) callback(null);
      return session;
    };
    session.touch = () => {
      return session;
    };

    return session;
  };

  describe('getUserNotifications', () => {
    const mockNotifications: NotificationWithDetails[] = [
      {
        id: 1,
        user_id: 1,
        type_id: 1,
        title: 'Test Notification',
        message: 'Test Message',
        link: null,
        is_read: false,
        active: true,
        read_on: null,
        created_on: new Date(),
        type_name: 'TaskDueSoon',
        type_icon: 'clock',
        type_color: '#ffa500'
      }
    ];

    it('should get user notifications successfully', async () => {
      mockRequest.params = { user_id: '1' };
      jest.spyOn(notificationModel, 'getNotificationsByUserId').mockResolvedValueOnce(mockNotifications);

      await getUserNotifications(mockRequest as Request, mockResponse, mockPool);

      expect(notificationModel.getNotificationsByUserId).toHaveBeenCalledWith(mockPool, '1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockNotifications);
    });

    it('should handle errors when getting notifications', async () => {
      mockRequest.params = { user_id: '1' };
      const error = new Error('Database error');
      jest.spyOn(notificationModel, 'getNotificationsByUserId').mockRejectedValueOnce(error);

      await getUserNotifications(mockRequest as Request, mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('markAsRead', () => {
    const mockUpdatedNotifications: Notification[] = [
      {
        id: 1,
        user_id: 1,
        type_id: 1,
        title: 'Test Notification',
        message: 'Test Message',
        link: null,
        is_read: true,
        active: true,
        read_on: new Date(),
        created_on: new Date()
      }
    ];

    it('should mark notifications as read successfully', async () => {
      mockRequest.params = { user_id: '1' };
      jest.spyOn(notificationModel, 'markNotificationsAsRead').mockResolvedValueOnce(mockUpdatedNotifications);

      await markAsRead(mockRequest as Request, mockResponse, mockPool);

      expect(notificationModel.markNotificationsAsRead).toHaveBeenCalledWith(mockPool, '1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedNotifications);
    });

    it('should handle errors when marking notifications as read', async () => {
      mockRequest.params = { user_id: '1' };
      const error = new Error('Database error');
      jest.spyOn(notificationModel, 'markNotificationsAsRead').mockRejectedValueOnce(error);

      await markAsRead(mockRequest as Request, mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      mockRequest.params = { id: '1' };
      jest.spyOn(notificationModel, 'deleteNotification').mockResolvedValueOnce(undefined);

      await deleteNotification(mockRequest as Request, mockResponse, mockPool);

      expect(notificationModel.deleteNotification).toHaveBeenCalledWith(mockPool, '1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Notification deleted' });
    });

    it('should handle errors when deleting notification', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      jest.spyOn(notificationModel, 'deleteNotification').mockRejectedValueOnce(error);

      await deleteNotification(mockRequest as Request, mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
