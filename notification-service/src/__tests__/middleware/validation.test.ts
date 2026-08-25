import { Request, Response, NextFunction } from 'express';
import { validateNotification } from '../../middleware/validation';
import { NotificationCreateRequest } from '../../types/notification-routes.types';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request<{}, {}, NotificationCreateRequest>>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    mockNext = jest.fn();
    mockRequest = {
      body: {} as NotificationCreateRequest,
    };
  });

  describe('validateNotification', () => {
    it('should call next() when all required fields are present', () => {
      mockRequest.body = {
        type: 'Task Assigned',
        userId: '123',
        data: { taskId: 1 },
      };

      validateNotification(
        mockRequest as Request<{}, {}, NotificationCreateRequest>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return 400 when type is missing', () => {
      mockRequest.body = {
        type: '' as string,
        userId: '123',
        data: { taskId: 1 },
      };

      validateNotification(
        mockRequest as Request<{}, {}, NotificationCreateRequest>,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid notification data',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when userId is missing', () => {
      mockRequest.body = {
        type: 'Task Assigned',
        userId: '',
        data: { taskId: 1 },
      };

      validateNotification(
        mockRequest as Request<{}, {}, NotificationCreateRequest>,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid notification data',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when data is missing', () => {
      mockRequest.body = {
        type: 'Task Assigned',
        userId: '123',
        data: null as any,
      };

      validateNotification(
        mockRequest as Request<{}, {}, NotificationCreateRequest>,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid notification data',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when all fields are missing', () => {
      mockRequest.body = {} as NotificationCreateRequest;

      validateNotification(
        mockRequest as Request<{}, {}, NotificationCreateRequest>,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid notification data',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept valid data with different notification types', () => {
      const validTypes = ['Task Due Soon', 'Task Assigned', 'Task Updated', 'Task Comment', 'Task Completed', 'Project Update'];

      validTypes.forEach((type) => {
        mockNext.mockClear();
        mockStatus.mockClear();

        mockRequest.body = {
          type,
          userId: '456',
          data: { key: 'value' },
        };

        validateNotification(
          mockRequest as Request<{}, {}, NotificationCreateRequest>,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
      });
    });

    it('should include proper error response structure', () => {
      mockRequest.body = {
        type: '',
        userId: '',
        data: null as any,
      };

      validateNotification(
        mockRequest as Request<{}, {}, NotificationCreateRequest>,
        mockResponse as Response,
        mockNext
      );

      expect(mockJson).toHaveBeenCalledWith({
        id: '',
        type_id: 0,
        user_id: '',
        created_on: expect.any(Date),
        error: 'Invalid notification data',
      });
    });

    it('should return 400 when type is invalid', () => {
      mockRequest.body = {
        type: 'unknownType',
        userId: '123',
        data: { taskId: 1 },
      };

      validateNotification(
        mockRequest as Request<{}, {}, NotificationCreateRequest>,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid notification type' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when userId is not a positive integer', () => {
      mockRequest.body = {
        type: 'Task Assigned',
        userId: 'abc',
        data: { taskId: 1 },
      };

      validateNotification(
        mockRequest as Request<{}, {}, NotificationCreateRequest>,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid user id' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when userId is negative', () => {
      mockRequest.body = {
        type: 'Task Assigned',
        userId: '-1',
        data: { taskId: 1 },
      };

      validateNotification(
        mockRequest as Request<{}, {}, NotificationCreateRequest>,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid user id' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
