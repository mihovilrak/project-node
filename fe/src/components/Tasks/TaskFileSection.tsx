import React from 'react';
import { Paper } from '@mui/material';
import FileUpload from '../Files/FileUpload';
import FileList from '../Files/FileList';
import { TaskFileSectionProps } from '../../types/file';

const TaskFileSection: React.FC<TaskFileSectionProps> = ({
  taskId,
  files,
  onFileUploaded,
  onFileDeleted
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <FileUpload
        taskId={taskId}
        onFileUploaded={onFileUploaded}
      />
      <FileList
        files={files}
        taskId={taskId}
        onFileDeleted={onFileDeleted}
      />
    </Paper>
  );
};

export default TaskFileSection;
