import { Pool } from 'pg';
import * as fileModel from '../fileModel';
import * as taskModel from '../taskModel';

// Mock the pg module
jest.mock('pg', () => ({
  Pool: jest.fn()
}));

jest.mock('../taskModel');

describe('FileModel', () => {
  let mockPool: jest.Mocked<Pool>;

  const mockQueryResult = (rows: any[]) => ({
    rows,
    rowCount: rows.length,
    command: '',
    oid: 0,
    fields: []
  });

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('getTaskFiles', () => {
    it('should return all files for a task', async () => {
      const mockFiles = [
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          user_name: 'John Doe',
          original_name: 'document.pdf',
          stored_name: 'uuid-document.pdf',
          size: 1024,
          mime_type: 'application/pdf',
          file_path: '/uploads/uuid-document.pdf',
          created_on: new Date()
        },
        {
          id: 2,
          task_id: 1,
          user_id: 2,
          user_name: 'Jane Doe',
          original_name: 'image.png',
          stored_name: 'uuid-image.png',
          size: 2048,
          mime_type: 'image/png',
          file_path: '/uploads/uuid-image.png',
          created_on: new Date()
        }
      ];
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockFiles));

      const result = await fileModel.getTaskFiles(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM get_task_files($1)',
        ['1']
      );
      expect(result).toEqual(mockFiles);
    });

    it('should return empty array when no files exist', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await fileModel.getTaskFiles(mockPool, '999');

      expect(result).toEqual([]);
    });
  });

  describe('createFile', () => {
    it('should create a new file record', async () => {
      const newFile = {
        id: 1,
        task_id: 1,
        user_id: 1,
        original_name: 'newfile.pdf',
        stored_name: 'uuid-newfile.pdf',
        size: 5120,
        mime_type: 'application/pdf',
        file_path: '/uploads/uuid-newfile.pdf',
        created_on: new Date()
      };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([newFile]));

      const result = await fileModel.createFile(
        mockPool,
        '1',
        '1',
        'newfile.pdf',
        'uuid-newfile.pdf',
        5120,
        'application/pdf',
        '/uploads/uuid-newfile.pdf'
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO files'),
        ['1', '1', 'newfile.pdf', 'uuid-newfile.pdf', 5120, 'application/pdf', '/uploads/uuid-newfile.pdf']
      );
      expect(result).toEqual(newFile);
    });
  });

  describe('getFileById', () => {
    it('should return a file by ID', async () => {
      const mockFile = {
        id: 1,
        task_id: 1,
        user_id: 1,
        original_name: 'document.pdf',
        stored_name: 'uuid-document.pdf',
        size: 1024,
        mime_type: 'application/pdf',
        file_path: '/uploads/uuid-document.pdf',
        created_on: new Date()
      };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockFile]));

      const result = await fileModel.getFileById(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM files'),
        ['1']
      );
      expect(result).toEqual(mockFile);
    });

    it('should return null when file not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await fileModel.getFileById(mockPool, '999');

      expect(result).toBeNull();
    });
  });

  describe('deleteFile', () => {
    it('should delete a file by ID', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      await fileModel.deleteFile(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM files'),
        ['1']
      );
    });
  });

  describe('canUserAccessFile', () => {
    it('should return true when user is project member', async () => {
      const mockFile = { id: 1, task_id: 10, user_id: 1 };
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce(mockQueryResult([mockFile]))
        .mockResolvedValueOnce({ rows: [{ 1: 1 }], rowCount: 1 });
      (taskModel.getTaskById as jest.Mock).mockResolvedValue({ id: 10, project_id: 5 });

      const result = await fileModel.canUserAccessFile(mockPool, '1', '1');

      expect(result).toBe(true);
    });

    it('should return false when file not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await fileModel.canUserAccessFile(mockPool, '1', '999');

      expect(result).toBe(false);
    });

    it('should return false when user is not project member', async () => {
      const mockFile = { id: 1, task_id: 10, user_id: 1 };
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce(mockQueryResult([mockFile]))
        .mockResolvedValueOnce({ rows: [], rowCount: 0 });
      (taskModel.getTaskById as jest.Mock).mockResolvedValue({ id: 10, project_id: 5 });

      const result = await fileModel.canUserAccessFile(mockPool, '99', '1');

      expect(result).toBe(false);
    });
  });
});
