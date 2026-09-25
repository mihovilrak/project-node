import { api } from '../api';
import { Tag } from '../../types/tag';
import { addTaskTags, getTags, getTaskTags, removeTaskTag } from '../tags';

// Mock the api module
jest.mock('../api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Tags API', () => {
  // Mock data
  const mockTag: Tag = {
    id: 1,
    name: 'Test Tag',
    color: '#FF0000',
    description: 'Test Description',
    created_by: 1,
    active: true,
    created_on: '2023-01-01T00:00:00Z',
    creator_name: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTags', () => {
    it('should fetch tags successfully', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [mockTag] });

      const result = await getTags();

      expect(mockedApi.get).toHaveBeenCalledWith('/tags', {
        signal: undefined,
      });
      expect(result).toEqual([mockTag]);
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Network error');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(getTags()).rejects.toThrow(error);
    });
  });

  describe('getTaskTags', () => {
    it('should fetch task tags successfully', async () => {
      const taskId = 1;
      mockedApi.get.mockResolvedValueOnce({ data: [mockTag] });

      const result = await getTaskTags(taskId);

      expect(mockedApi.get).toHaveBeenCalledWith(`/tasks/${taskId}/tags`, {
        signal: undefined,
      });
      expect(result).toEqual([mockTag]);
    });

    it('should throw error when fetching task tags fails', async () => {
      const error = new Error('Failed to fetch task tags');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(getTaskTags(1)).rejects.toThrow(error);
    });
  });

  describe('addTaskTags', () => {
    it('posts integer tag ids and returns the task tags', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: [mockTag] });

      const result = await addTaskTags(3, [1, '2' as unknown as number]);

      expect(mockedApi.post).toHaveBeenCalledWith('/tasks/3/tags', {
        tagIds: [1, 2],
      });
      expect(result).toEqual([mockTag]);
    });
  });

  describe('removeTaskTag', () => {
    it('deletes the task tag', async () => {
      mockedApi.delete.mockResolvedValueOnce({ data: {} });

      await removeTaskTag(3, 1);

      expect(mockedApi.delete).toHaveBeenCalledWith('/tasks/3/tags/1');
    });
  });
});
