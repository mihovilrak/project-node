import { Pool } from 'pg';
import * as tagModel from '../tagModel';

// Helper to create mock query result
const mockQueryResult = (rows: any[]) => ({
  rows,
  rowCount: rows.length,
  command: '',
  oid: 0,
  fields: [],
});

describe('TagModel', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('getTags', () => {
    it('should return all active tags', async () => {
      const mockTags = [{ id: '1', name: 'Tag1', color: '#FF0000' }];
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult(mockTags),
      );

      const result = await tagModel.getTags(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE active = true'),
      );
      expect(result).toEqual(mockTags);
    });
  });

  describe('createTag', () => {
    it('should create a tag', async () => {
      const mockTag = { id: '1', name: 'NewTag', color: '#00FF00' };
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([mockTag]),
      );

      const result = await tagModel.createTag(mockPool, 'NewTag', '#00FF00');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tags'),
        ['NewTag', '#00FF00', 'Label'],
      );
      expect(result).toEqual(mockTag);
    });
  });

  describe('addTaskTags', () => {
    it('should add tags to a task', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      await tagModel.addTaskTags(mockPool, '1', [1, 2]);

      expect(mockPool.query).toHaveBeenCalledWith(
        `SELECT add_task_tags($1, $2)`,
        ['1', [1, 2]],
      );
    });
  });

  describe('removeTaskTag', () => {
    it('returns true when a row was removed', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      await expect(tagModel.removeTaskTag(mockPool, '1', '1')).resolves.toBe(
        true,
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM task_tags'),
        ['1', '1'],
      );
    });

    it('returns false when the tag was not on the task', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      await expect(tagModel.removeTaskTag(mockPool, '1', '2')).resolves.toBe(
        false,
      );
    });
  });

  describe('getTaskTags', () => {
    it('should return tags for a task', async () => {
      const mockTags = [{ id: '1', name: 'Tag1' }];
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult(mockTags),
      );

      const result = await tagModel.getTaskTags(mockPool, '1');

      expect(result).toEqual(mockTags);
    });
  });

  describe('updateTag', () => {
    it('sets only the provided columns', async () => {
      const mockTag = { id: '1', name: 'Updated', color: '#0000FF' };
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([mockTag]),
      );

      const result = await tagModel.updateTag(mockPool, '1', {
        color: '#0000FF',
      });

      const [sql, params] = (mockPool.query as jest.Mock).mock.calls[0];
      expect(sql).toContain('SET color = $1');
      expect(sql).toContain('WHERE id = $2');
      expect(sql).not.toContain('updated_on');
      expect(params).toEqual(['#0000FF', '1']);
      expect(result).toEqual(mockTag);
    });

    it('returns the current tag when nothing changes', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([{ id: '1' }]),
      );

      await expect(tagModel.updateTag(mockPool, '1', {})).resolves.toEqual({
        id: '1',
      });
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM tags WHERE id = $1',
        ['1'],
      );
    });

    it('should return null when tag not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await tagModel.updateTag(mockPool, '999', {
        name: 'Updated',
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteTag', () => {
    it('should soft delete an active tag', async () => {
      const mockTag = { id: '1', active: false };
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([mockTag]),
      );

      const result = await tagModel.deleteTag(mockPool, '1');

      const [sql, params] = (mockPool.query as jest.Mock).mock.calls[0];
      expect(sql).toContain('SET active = false');
      expect(sql).toContain('AND active = true');
      expect(params).toEqual(['1']);
      expect(result).toEqual(mockTag);
    });
  });
});
