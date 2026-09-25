import { useAsyncResource } from '../common/useAsyncResource';
import { TaskFile } from '../../types/file';
import { getTaskFiles, deleteFile } from '../../api/files';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const EMPTY_FILES: TaskFile[] = [];

/**
 * Load a task's files and delete them. Uploads go through useFileUpload.
 *
 * @param taskId String
 */
export const useTaskFiles = (taskId: string) => {
  const {
    data: files,
    setData: setFiles,
    error,
    refetch: refreshFiles,
  } = useAsyncResource<TaskFile[]>(
    async (signal) => (await getTaskFiles(Number(taskId), signal)) || [],
    [taskId],
    {
      initialData: EMPTY_FILES,
      enabled: Boolean(taskId),
      errorMessage: 'Failed to fetch files',
    },
  );

  const handleFileDelete = async (fileId: number) => {
    try {
      if (!taskId) throw new Error('Task ID is required');
      if (!fileId) throw new Error('File ID is required');

      await deleteFile(Number(taskId), fileId);
      setFiles((prev) => prev.filter((file) => file?.id !== fileId));
    } catch (error: unknown) {
      logger.error('Failed to delete file:', error);
      throw new Error(getApiErrorMessage(error, 'Failed to delete file'));
    }
  };

  return {
    files,
    error,
    handleFileDelete,
    refreshFiles,
  };
};
