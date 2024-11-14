import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FileUpload from '../Files/FileUpload';
import FileList from '../Files/FileList';

const TaskFiles = ({ taskId, files, onFileUploaded, onFileDeleted }) => {
  return (
    <Paper sx={{ mt: 3, p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Files ({files.length})
      </Typography>
      
      <FileUpload 
        taskId={taskId} 
        onFileUploaded={onFileUploaded} 
      />
      
      <Box sx={{ mt: 2 }}>
        <FileList 
          files={files} 
          taskId={taskId}
          onFileDeleted={onFileDeleted}
        />
      </Box>
    </Paper>
  );
};

export default TaskFiles; 