import React, { useCallback } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import FileUpload from '../Files/FileUpload';
import FileList from '../Files/FileList';
import { TaskFileSectionProps, TaskFile } from '../../types/file';
import { useTaskFiles } from '../../hooks/task/useTaskFiles';

const TaskFileSection: React.FC<TaskFileSectionProps> = ({
  taskId,
  files,
  onFileUploaded,
  onFileDeleted
}) => {
  const { refreshFiles } = useTaskFiles(String(taskId));

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
    <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6" component="h2">
          Files ({files.length})
        </Typography>
        <FileUpload
          taskId={taskId}
          onFileUploaded={handleFileUploaded}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mt: 2 }}>
        <FileList
          files={files}
          taskId={taskId}
          onFileDeleted={handleFileDeleted}
        />
      </Box>
    </Paper>
  );
};

export default TaskFileSection;
