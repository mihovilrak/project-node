import { Pool } from 'pg';
import * as taskTypeModel from '../taskTypeModel';

// Helper to create mock query result
const mockQueryResult = (rows: any[]) => ({ rows, rowCount: rows.length, command: '', oid: 0, fields: [] });

describe('TaskTypeModel', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('getTaskTypes', () => {
    it('should return all active task types', async () => {
      const mockTypes = [{ id: '1', name: 'Bug', color: '#FF0000' }];
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockTypes));

      const result = await taskTypeModel.getTaskTypes(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE active = true'));
      expect(result).toEqual(mockTypes);
    });
  });

  describe('getTaskTypeById', () => {
    it('should return a task type by ID', async () => {
      const mockType = { id: '1', name: 'Bug', color: '#FF0000' };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockType]));

      const result = await taskTypeModel.getTaskTypeById(mockPool, '1');

      expect(result).toEqual(mockType);
    });

    it('should return null when task type not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await taskTypeModel.getTaskTypeById(mockPool, '999');

      expect(result).toBeNull();
    });
  });

  describe('createTaskType', () => {
    it('should create a task type', async () => {
      const mockType = { id: '1', name: 'Feature', color: '#00FF00' };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockType]));

      const result = await taskTypeModel.createTaskType(
        mockPool, 'Feature', 'Feature description', '#00FF00', 'icon', true
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_types'),
        ['Feature', 'Feature description', '#00FF00', 'icon', true]
      );
      expect(result).toEqual(mockType);
    });
  });

  describe('updateTaskType', () => {
    it('should update a task type', async () => {
      const mockType = { id: '1', name: 'Updated Bug' };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockType]));

      const result = await taskTypeModel.updateTaskType(
        mockPool, '1', 'Updated Bug', 'Updated description', '#0000FF', 'newicon', true
      );

      expect(result).toEqual(mockType);
    });

    it('should return null when task type not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await taskTypeModel.updateTaskType(
        mockPool, '999', 'Updated', null, null, null, null
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteTaskType', () => {
    it('should soft delete a task type', async () => {
      const mockType = { id: '1', active: false };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockType]));

      const result = await taskTypeModel.deleteTaskType(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET (active, updated_on) = (false'),
        ['1']
      );
      expect(result).toEqual(mockType);
    });

    it('should return null when task type not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await taskTypeModel.deleteTaskType(mockPool, '999');

      expect(result).toBeNull();
    });
  });
});
