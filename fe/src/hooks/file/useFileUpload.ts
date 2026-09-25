import { useState } from 'react';
import { uploadFile } from '../../api/files';
import { TaskFile } from '../../types/file';
import { AxiosProgressEvent } from 'axios';
import {
  FILE_TOO_LARGE_MESSAGE,
  validateUploadFile,
} from '../../constants/uploads';
import getApiErrorMessage, {
  getApiErrorStatus,
} from '../../utils/getApiErrorMessage';

/**
 * Manage file uploads with progress tracking and validation for a specific
 * task.
 *
 * @param taskId Numeric identifier of the task to associate with the uploaded
 *   file.
 * @param onFileUploaded Callback invoked with the uploaded TaskFile object upon
 *   successful completion.
 */
export const useFileUpload = (
  taskId: number,
  onFileUploaded: (file: TaskFile) => void,
) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.target;
    const selectedFile = input.files?.[0];
    if (!selectedFile) return;

    try {
      setError(null);
      const validationError = validateUploadFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const progressCallback = (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setProgress(percentage);
        }
      };

      const response = await uploadFile(taskId, formData, progressCallback);
      if (response) {
        onFileUploaded(response);
      }
    } catch (err) {
      setError(
        getApiErrorStatus(err) === 413
          ? FILE_TOO_LARGE_MESSAGE
          : getApiErrorMessage(err, 'Failed to upload file'),
      );
    } finally {
      setUploading(false);
      setProgress(0);
      input.value = '';
    }
  };

  return {
    uploading,
    progress,
    error,
    handleFileChange,
    setError,
  };
};
