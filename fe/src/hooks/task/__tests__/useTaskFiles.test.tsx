import { renderHook, act } from '@testing-library/react-hooks';
import { useTaskFiles } from '../useTaskFiles';
import { getTaskFiles, uploadFile, deleteFile } from '../../../api/files';
import { TaskFile } from '../../../types/file';

// Mock API calls
jest.mock('../../../api/files');

describe('useTaskFiles', () => {
  const mockFiles: TaskFile[] = [
    {
      id: 1,
      task_id: 1,
      user_id: 1,
      name: 'test-file-1.txt',
      original_name: 'test1.txt',
      mime_type: 'text/plain',
      size: 1024,
      uploaded_on: '2024-01-25T00:00:00Z',
      uploaded_by: 'Test User'
    },
    {
      id: 2,
      task_id: 1,
      user_id: 1,
      name: 'test-file-2.txt',
      original_name: 'test2.txt',
      mime_type: 'text/plain',
      size: 2048,
      uploaded_on: '2024-01-25T00:00:00Z',
      uploaded_by: 'Test User'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getTaskFiles as jest.Mock).mockResolvedValue(mockFiles);
  });

  it('should load files successfully', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTaskFiles('1'));

    await waitForNextUpdate();

    expect(getTaskFiles).toHaveBeenCalledWith(1);
    expect(result.current.files).toEqual(mockFiles);
  });

  it('should handle file upload successfully', async () => {
    const newFile: TaskFile = {
      id: 3,
      task_id: 1,
      user_id: 1,
      name: 'new-file.txt',
      original_name: 'new.txt',
      mime_type: 'text/plain',
      size: 4096,
      uploaded_on: '2024-01-25T00:00:00Z',
      uploaded_by: 'Test User'
    };

    const mockFile = new File(['test content'], 'new.txt', { type: 'text/plain' });
    (uploadFile as jest.Mock).mockResolvedValue(newFile);
    (getTaskFiles as jest.Mock).mockResolvedValue([...mockFiles, newFile]);

    const { result, waitForNextUpdate } = renderHook(() => useTaskFiles('1'));
    await waitForNextUpdate();

    await act(async () => {
      await result.current.handleFileUpload(mockFile);
    });

    expect(uploadFile).toHaveBeenCalledWith(1, expect.any(FormData));
    expect(result.current.files).toEqual([...mockFiles, newFile]);
  });

  it('should handle file deletion successfully', async () => {
    (deleteFile as jest.Mock).mockResolvedValue(undefined);

    const { result, waitForNextUpdate } = renderHook(() => useTaskFiles('1'));
    await waitForNextUpdate();

    await act(async () => {
      await result.current.handleFileDelete(1);
    });

    expect(deleteFile).toHaveBeenCalledWith(1, 1);
    expect(result.current.files).toEqual([mockFiles[1]]);
  });

  it('should handle file upload error', async () => {
    const error = new Error('Failed to upload file');
    const mockFile = new File(['test content'], 'error.txt', { type: 'text/plain' });
    (uploadFile as jest.Mock).mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() => useTaskFiles('1'));
    await waitForNextUpdate();

    await expect(result.current.handleFileUpload(mockFile)).rejects.toThrow('Failed to upload file');
  });

  it('should handle file deletion error', async () => {
    const error = new Error('Failed to delete file');
    (deleteFile as jest.Mock).mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() => useTaskFiles('1'));
    await waitForNextUpdate();

    await expect(result.current.handleFileDelete(1)).rejects.toThrow('Failed to delete file');
  });

  it('should refresh files when called', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTaskFiles('1'));
    await waitForNextUpdate();

    // Clear initial call count
    (getTaskFiles as jest.Mock).mockClear();

    await act(async () => {
      await result.current.refreshFiles();
    });

    expect(getTaskFiles).toHaveBeenCalledWith(1);
  });
});
