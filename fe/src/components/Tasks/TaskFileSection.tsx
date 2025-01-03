import React from 'react';
import { Box, Typography } from '@mui/material';
import FileUpload from '../Files/FileUpload';
import FileList from '../Files/FileList';
import { TaskFileSectionProps } from '../../types/file';

const TaskFileSection: React.FC<TaskFileSectionProps> = ({
  taskId,
  files,
  onFileUploaded,
  onFileDeleted
}) => (
  <Box>
    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
      Files
    </Typography>
    <FileUpload
      taskId={taskId}
      onFileUploaded={onFileUploaded}
    />
    <FileList
      files={files}
      taskId={taskId}
      onFileDeleted={onFileDeleted}
    />
  </Box>
);

export default TaskFileSection;
