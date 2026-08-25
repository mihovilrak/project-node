import { Request, Response } from 'express';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import * as fileModel from '../../models/fileModel';
import {
  getTaskFiles,
  uploadFile,
  downloadFile,
  deleteFile
} from '../fileController';
import { File } from '../../types/file';
import { CustomRequest } from '../../types/express';
import { Session, SessionData } from 'express-session';

// Mock the dependencies
jest.mock('../../models/fileModel');
jest.mock('fs/promises');
jest.mock('fs');
jest.mock('path');

describe('fileController', () => {
  let mockReq: Partial<CustomRequest>;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

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

    // Add session methods that return the session object for chaining
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

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      download: jest.fn(),
    };
    mockPool = {} as Pool;
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getTaskFiles', () => {
    beforeEach(() => {
      mockReq = {
        taskId: '123',
      } as any as Partial<CustomRequest>;
    });

    it('should return files successfully', async () => {
      const mockFiles = [{ id: '1', name: 'test.txt' }];
      (fileModel.getTaskFiles as jest.Mock).mockResolvedValue(mockFiles);

      await getTaskFiles(mockReq as any, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockFiles);
      expect(fileModel.getTaskFiles).toHaveBeenCalledWith(mockPool, '123');
    });

    it('should pass error to next on errors', async () => {
      const error = new Error('Database error');
      (fileModel.getTaskFiles as jest.Mock).mockRejectedValue(error);

      await expect(
        getTaskFiles(mockReq as any, mockRes as Response, mockPool as Pool)
      ).rejects.toThrow('Database error');
      expect(mockRes.status).not.toHaveBeenCalledWith(500);
    });
  });

  describe('uploadFile', () => {
    const mockFile = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      destination: '/uploads',
      filename: 'stored-test.txt',
      path: '/uploads/stored-test.txt',
      size: 1024,
      stream: {} as any,
      buffer: Buffer.from([])
    };

    beforeEach(() => {
      mockReq = {
        taskId: '123',
        session: createMockSession(true),
        file: mockFile,
      } as any as Partial<CustomRequest>;
    });

    it('should upload file successfully', async () => {
      const mockFileData = { id: '1', ...mockFile };
      (fileModel.createFile as jest.Mock).mockResolvedValue(mockFileData);
      (path.join as jest.Mock).mockReturnValue('uploads/stored-test.txt');

      await uploadFile(mockReq as any, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockFileData);
      expect(fileModel.createFile).toHaveBeenCalledWith(
        mockPool,
        '123',
        '1',
        mockFile.originalname,
        mockFile.filename,
        mockFile.size,
        mockFile.mimetype,
        'uploads/stored-test.txt'
      );
    });

    it('should handle unauthorized user', async () => {
      mockReq.session = createMockSession(false);

      await uploadFile(mockReq as any, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should handle missing file', async () => {
      mockReq.file = undefined;

      await uploadFile(mockReq as any, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
    });

    it('should handle invalid task ID', async () => {
      mockReq = {
        taskId: 'invalid',
        session: createMockSession(true),
        file: mockFile,
      } as any as Partial<CustomRequest>;

      await uploadFile(mockReq as any, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid task ID' });
    });

    it('should pass error to next on upload errors', async () => {
      const error = new Error('Upload error');
      (fileModel.createFile as jest.Mock).mockRejectedValue(error);

      await expect(
        uploadFile(mockReq as any, mockRes as Response, mockPool as Pool)
      ).rejects.toThrow('Upload error');
      expect(mockRes.status).not.toHaveBeenCalledWith(500);
    });
  });

  describe('downloadFile', () => {
    const mockFile: File = {
      id: 1,
      task_id: 1,
      user_id: 1,
      name: 'test.txt',
      original_name: 'test.txt',
      stored_name: 'stored-test.txt',
      mime_type: 'text/plain',
      size: 1024,
      created_on: new Date(),
      updated_on: new Date(),
      active: true,
    };

    beforeEach(() => {
      mockReq = {
        params: { fileId: '1' },
        session: createMockSession(true),
      } as any as Partial<CustomRequest>;
      (path.resolve as jest.Mock).mockReturnValue('/path/to/file');
      (path.relative as jest.Mock).mockReturnValue('stored-test.txt');
    });

    it('should download file successfully', async () => {
      (fileModel.getFileById as jest.Mock).mockResolvedValue(mockFile);
      (fileModel.canUserAccessFile as jest.Mock).mockResolvedValue(true);
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);

      await downloadFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(mockRes.download).toHaveBeenCalledWith('/path/to/file', mockFile.original_name);
    });

    it('should return 401 when user not authenticated', async () => {
      mockReq.session = createMockSession(false);
      (fileModel.getFileById as jest.Mock).mockResolvedValue(mockFile);

      await downloadFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should handle file not found in database', async () => {
      (fileModel.getFileById as jest.Mock).mockResolvedValue(null);

      await downloadFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'File not found' });
    });

    it('should return 403 when user does not have access to file', async () => {
      (fileModel.getFileById as jest.Mock).mockResolvedValue(mockFile);
      (fileModel.canUserAccessFile as jest.Mock).mockResolvedValue(false);

      await downloadFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied to this file' });
    });

    it('should return 403 when resolved path escapes uploads dir', async () => {
      (fileModel.getFileById as jest.Mock).mockResolvedValue(mockFile);
      (fileModel.canUserAccessFile as jest.Mock).mockResolvedValue(true);
      (path.relative as jest.Mock).mockReturnValue('../etc/passwd');

      await downloadFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid file path' });
    });

    it('should handle file not found on disk', async () => {
      (fileModel.getFileById as jest.Mock).mockResolvedValue(mockFile);
      (fileModel.canUserAccessFile as jest.Mock).mockResolvedValue(true);
      (fsSync.existsSync as jest.Mock).mockReturnValue(false);

      await downloadFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'File not found on disk' });
    });

    it('should pass error to next on download errors', async () => {
      (fileModel.getFileById as jest.Mock).mockRejectedValue(new Error('Download error'));

      await expect(
        downloadFile(mockReq as Request, mockRes as Response, mockPool as Pool)
      ).rejects.toThrow('Download error');
      expect(mockRes.status).not.toHaveBeenCalledWith(500);
    });
  });

  describe('deleteFile', () => {
    const mockFile: File = {
      id: 1,
      task_id: 123,
      user_id: 1,
      name: 'test.txt',
      original_name: 'test.txt',
      stored_name: 'stored-test.txt',
      mime_type: 'text/plain',
      size: 1024,
      created_on: new Date(),
      updated_on: new Date(),
      active: true,
    };

    beforeEach(() => {
      mockReq = {
        params: { fileId: '1' },
        session: createMockSession(true),
      } as any as Partial<CustomRequest>;
      (path.resolve as jest.Mock).mockReturnValue('/path/to/file');
      (path.relative as jest.Mock).mockReturnValue('stored-test.txt');
    });

    it('should delete file successfully', async () => {
      (fileModel.getFileById as jest.Mock).mockResolvedValue(mockFile);
      (fileModel.canUserAccessFile as jest.Mock).mockResolvedValue(true);
      (fileModel.deleteFile as jest.Mock).mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await deleteFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(fileModel.deleteFile).toHaveBeenCalledWith(mockPool, '1');
      expect(fs.unlink).toHaveBeenCalledWith('/path/to/file');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'File deleted successfully' });
    });

    it('should return 401 when user not authenticated', async () => {
      mockReq.session = createMockSession(false);
      (fileModel.getFileById as jest.Mock).mockResolvedValue(mockFile);

      await deleteFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
      expect(fileModel.deleteFile).not.toHaveBeenCalled();
    });

    it('should handle file not found', async () => {
      (fileModel.getFileById as jest.Mock).mockResolvedValue(null);

      await deleteFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'File not found' });
      expect(fileModel.deleteFile).not.toHaveBeenCalled();
      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have access to file', async () => {
      (fileModel.getFileById as jest.Mock).mockResolvedValue(mockFile);
      (fileModel.canUserAccessFile as jest.Mock).mockResolvedValue(false);

      await deleteFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied to this file' });
      expect(fileModel.deleteFile).not.toHaveBeenCalled();
    });

    it('should pass error to next on database deletion error', async () => {
      (fileModel.getFileById as jest.Mock).mockResolvedValue(mockFile);
      (fileModel.canUserAccessFile as jest.Mock).mockResolvedValue(true);
      (fileModel.deleteFile as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        deleteFile(mockReq as Request, mockRes as Response, mockPool as Pool)
      ).rejects.toThrow('Database error');
      expect(mockRes.status).not.toHaveBeenCalledWith(500);
    });

    it('should succeed even if file does not exist on disk', async () => {
      (fileModel.getFileById as jest.Mock).mockResolvedValue(mockFile);
      (fileModel.canUserAccessFile as jest.Mock).mockResolvedValue(true);
      (fileModel.deleteFile as jest.Mock).mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockRejectedValue(new Error('File not found'));

      await deleteFile(mockReq as Request, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'File deleted successfully' });
    });
  });
});
