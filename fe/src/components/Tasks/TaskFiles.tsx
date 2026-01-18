import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';
import FileUpload from '../Files/FileUpload';
import FileList from '../Files/FileList';
import { TaskFilesProps, TaskFile } from '../../types/file';
import { useTaskFiles } from '../../hooks/task/useTaskFiles';

const TaskFiles: React.FC<TaskFilesProps> = ({ taskId, onFileUploaded, onFileDeleted }) => {
  const { files, refreshFiles } = useTaskFiles(String(taskId));

  const handleFileUploaded = useCallback(async (file: TaskFile) => {
    await refreshFiles();
    if (onFileUploaded) {
      onFileUploaded(file);
    }
  }, [refreshFiles, onFileUploaded]);

  const handleFileDeleted = useCallback(async (fileId: number) => {
    await refreshFiles();
    if (onFileDeleted) {
      onFileDeleted(fileId);
    }
  }, [refreshFiles, onFileDeleted]);

  return (
    <Paper sx={{ mt: 3, p: 3 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6" gutterBottom>
          Files ({files.length})
        </Typography>

        <FileUpload
          taskId={taskId}
          onFileUploaded={handleFileUploaded}
        />
      </Box>

      <FileList
        files={files}
        taskId={taskId}
        onFileDeleted={handleFileDeleted}
      />
    </Paper>
  );
};

export default TaskFiles;
