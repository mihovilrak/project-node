import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as commentModel from '../../models/commentModel';
import * as notificationModel from '../../models/notificationModel';
import {
  getTaskComments,
  createComment,
  editComment,
  deleteComment,
  MAX_COMMENT_LENGTH,
} from '../commentController';
import { Comment, CommentWithUser, TaskRequest } from '../../types/comment';
import { NotificationType } from '../../types/notification';
import { CustomRequest } from '../../types/express';

jest.mock('../../models/commentModel');
jest.mock('../../models/notificationModel');

describe('Comment Controller', () => {
  let mockClient: { query: jest.Mock; release: jest.Mock };
  let mockPool: Pool;
  let mockResponse: Response;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  const comment: Comment = {
    id: 1,
    task_id: 1,
    user_id: 1,
    comment: 'New comment',
    created_on: new Date(),
    updated_on: new Date(),
    active: true,
  };
  const commentWithUser: CommentWithUser = { ...comment, user_name: 'John' };

  const createReq = (
    body: unknown,
    withUser = true,
  ): CustomRequest & TaskRequest =>
    ({
      taskId: '1',
      body,
      session: withUser ? { user: { id: '1' } } : {},
    }) as unknown as CustomRequest & TaskRequest;

  const editReq = (body?: unknown): Request & TaskRequest =>
    ({ taskId: '5', params: { id: '1' }, body }) as unknown as Request &
      TaskRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    };
    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    } as unknown as Pool;
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response;
  });

  describe('getTaskComments', () => {
    it('returns the comments of the task', async () => {
      (commentModel.getTaskComments as jest.Mock).mockResolvedValueOnce([
        commentWithUser,
      ]);

      await getTaskComments(
        { taskId: '1' } as TaskRequest,
        mockResponse,
        mockPool,
      );

      expect(commentModel.getTaskComments).toHaveBeenCalledWith(mockPool, '1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith([commentWithUser]);
    });

    it('forwards database errors', async () => {
      (commentModel.getTaskComments as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(
        getTaskComments({ taskId: '1' } as TaskRequest, mockResponse, mockPool),
      ).rejects.toThrow('Database error');
    });
  });

  describe('createComment', () => {
    it('creates the comment and notifies watchers in one transaction', async () => {
      (commentModel.createComment as jest.Mock).mockResolvedValueOnce(comment);
      (
        notificationModel.createWatcherNotifications as jest.Mock
      ).mockResolvedValueOnce([]);

      await createComment(
        createReq({ comment: 'New comment' }),
        mockResponse,
        mockPool,
      );

      expect(commentModel.createComment).toHaveBeenCalledWith(
        mockClient,
        '1',
        '1',
        'New comment',
      );
      expect(notificationModel.createWatcherNotifications).toHaveBeenCalledWith(
        mockClient,
        {
          task_id: 1,
          action_user_id: 1,
          type: NotificationType.TaskComment,
        },
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(comment);
    });

    it('rolls back the comment when notifying fails', async () => {
      (commentModel.createComment as jest.Mock).mockResolvedValueOnce(comment);
      (
        notificationModel.createWatcherNotifications as jest.Mock
      ).mockRejectedValueOnce(new Error('notify failed'));

      await expect(
        createComment(createReq({ comment: 'x' }), mockResponse, mockPool),
      ).rejects.toThrow('notify failed');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('throws 401 without a session user', async () => {
      await expect(
        createComment(
          createReq({ comment: 'x' }, false),
          mockResponse,
          mockPool,
        ),
      ).rejects.toMatchObject({ status: 401 });
      expect(commentModel.createComment).not.toHaveBeenCalled();
    });

    it.each([
      [undefined, 'Comment text is required'],
      [{}, 'Comment text is required'],
      [{ comment: '   ' }, 'Comment text is required'],
      [{ comment: 42 }, 'Comment text is required'],
      [
        { comment: 'a'.repeat(MAX_COMMENT_LENGTH + 1) },
        `Comment must be at most ${MAX_COMMENT_LENGTH} characters`,
      ],
    ])('rejects invalid body #%# with 400', async (body, error) => {
      await createComment(createReq(body), mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error });
      expect(commentModel.createComment).not.toHaveBeenCalled();
    });
  });

  describe('editComment', () => {
    it('edits the comment scoped to the task', async () => {
      (commentModel.editComment as jest.Mock).mockResolvedValueOnce(
        commentWithUser,
      );

      await editComment(
        editReq({ comment: 'Updated comment' }),
        mockResponse,
        mockPool,
      );

      expect(commentModel.editComment).toHaveBeenCalledWith(
        mockPool,
        '1',
        '5',
        'Updated comment',
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(commentWithUser);
    });

    it('returns 404 when no active comment matches on the task', async () => {
      (commentModel.editComment as jest.Mock).mockResolvedValueOnce(null);

      await editComment(editReq({ comment: 'x' }), mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Comment not found' });
    });

    it('returns 400 for empty text', async () => {
      await editComment(editReq({ comment: '' }), mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(commentModel.editComment).not.toHaveBeenCalled();
    });

    it('forwards database errors', async () => {
      (commentModel.editComment as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(
        editComment(editReq({ comment: 'x' }), mockResponse, mockPool),
      ).rejects.toThrow('Database error');
    });
  });

  describe('deleteComment', () => {
    it('deletes the comment scoped to the task', async () => {
      const deleted = { ...comment, active: false };
      (commentModel.deleteComment as jest.Mock).mockResolvedValueOnce(deleted);

      await deleteComment(editReq(), mockResponse, mockPool);

      expect(commentModel.deleteComment).toHaveBeenCalledWith(
        mockPool,
        '1',
        '5',
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(deleted);
    });

    it('returns 404 when no active comment matches on the task', async () => {
      (commentModel.deleteComment as jest.Mock).mockResolvedValueOnce(null);

      await deleteComment(editReq(), mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });
});
