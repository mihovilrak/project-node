import { api } from '../api';
import { TaskFile } from '../../types/file';
import {
  getTaskFiles,
  uploadFile,
  downloadFile,
  deleteFile
} from '../files';

jest.mock('../api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Files API', () => {
  const mockFile: TaskFile = {
    id: 1,
    task_id: 1,
    user_id: 1,
    name: 'test.txt',
    original_name: 'test.txt',
    mime_type: 'text/plain',
    size: 1024,
    uploaded_on: '2023-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  describe('getTaskFiles', () => {
    it('should fetch files for a task', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [mockFile] });

      const files = await getTaskFiles(1);
      
      expect(mockedApi.get).toHaveBeenCalledWith('/files', {
        params: { taskId: '1' }
      });
      expect(files).toEqual([mockFile]);
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Network error');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(getTaskFiles(1)).rejects.toThrow(error);
    });
  });

  describe('uploadFile', () => {
    it('should upload a file with progress tracking', async () => {
      const mockFormData = new FormData();
      const mockProgress = jest.fn();
      mockedApi.post.mockResolvedValueOnce({ data: mockFile });

      const result = await uploadFile(1, mockFormData, mockProgress);
      
      expect(mockedApi.post).toHaveBeenCalledWith('/files', mockFormData, {
        onUploadProgress: mockProgress,
        params: { taskId: '1' }
      });
      expect(result).toEqual(mockFile);
    });

    it('should throw error when upload fails', async () => {
      const error = new Error('Upload failed');
      mockedApi.post.mockRejectedValueOnce(error);

      await expect(uploadFile(1, new FormData())).rejects.toThrow(error);
    });
  });

  describe('downloadFile', () => {
    let mockLink: {
      href: string;
      setAttribute: jest.Mock;
      click: jest.Mock;
      remove: jest.Mock;
    };

    beforeEach(() => {
      mockLink = {
        href: '',
        setAttribute: jest.fn(),
        click: jest.fn(),
        remove: jest.fn()
      };
      document.createElement = jest.fn().mockReturnValue(mockLink);
      document.body.appendChild = jest.fn();
    });

    it('should download file with content disposition', async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: new Blob(['test']),
        headers: {
          'content-disposition': 'attachment; filename="test.txt"'
        }
      });

      await downloadFile(1, 1);

      expect(mockedApi.get).toHaveBeenCalledWith('/files/1/download', {
        params: { taskId: '1' },
        responseType: 'blob'
      });
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test.txt');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
    });

    it('should download file without content disposition', async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: new Blob(['test']),
        headers: {}
      });

      await downloadFile(1, 1);

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'download');
    });

    it('should throw error when download fails', async () => {
      const error = new Error('Download failed');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(downloadFile(1, 1)).rejects.toThrow(error);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      mockedApi.delete.mockResolvedValueOnce({ data: undefined });

      await deleteFile(1, 1);
      
      expect(mockedApi.delete).toHaveBeenCalledWith('/files/1', {
        params: { taskId: '1' }
      });
    });

    it('should throw error when deletion fails', async () => {
      const error = new Error('Delete failed');
      mockedApi.delete.mockRejectedValueOnce(error);

      await expect(deleteFile(1, 1)).rejects.toThrow(error);
    });
  });
});