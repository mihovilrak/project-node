import React, { useCallback, useState } from 'react';
import { Alert, Box, Typography, Paper } from '@mui/material';
import FileUpload from '../Files/FileUpload';
import FileList from '../Files/FileList';
import { TaskFilesProps, TaskFile } from '../../types/file';
import { useTaskFiles } from '../../hooks/task/useTaskFiles';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const TaskFiles: React.FC<TaskFilesProps> = ({
  taskId,
  onFileUploaded,
  onFileDeleted,
}) => {
  const {
    files,
    error: loadError,
    handleFileDelete,
    refreshFiles,
  } = useTaskFiles(String(taskId));
  const [actionError, setActionError] = useState<string | null>(null);

  const handleFileUploaded = useCallback(
    async (file: TaskFile) => {
      setActionError(null);
      await refreshFiles();
      onFileUploaded?.(file);
    },
    [refreshFiles, onFileUploaded],
  );

  const handleFileDeleted = useCallback(
    async (fileId: number) => {
      setActionError(null);
      try {
        await handleFileDelete(fileId);
        onFileDeleted?.(fileId);
      } catch (err: unknown) {
        setActionError(getApiErrorMessage(err, 'Failed to delete file'));
      }
    },
    [handleFileDelete, onFileDeleted],
  );

  const error = actionError ?? loadError;

  return (
    <Paper sx={{ mt: 3, p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Files ({files.length})
        </Typography>

        <FileUpload taskId={taskId} onFileUploaded={handleFileUploaded} />
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={actionError ? () => setActionError(null) : undefined}
        >
          {error}
        </Alert>
      )}

      <FileList
        files={files}
        taskId={taskId}
        onFileDeleted={handleFileDeleted}
        onError={setActionError}
      />
    </Paper>
  );
};

export default TaskFiles;
