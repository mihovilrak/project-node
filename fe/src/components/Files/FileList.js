import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  IconButton, 
  Typography,
  Box,
  Paper
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { deleteFile, downloadFile } from '../../api/files';

const FileList = ({ files, taskId, onFileDeleted }) => {
  const handleDownload = async (fileId, fileName) => {
    try {
      const blob = await downloadFile(taskId, fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(taskId, fileId);
        onFileDeleted(fileId);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (files.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        No files uploaded yet
      </Typography>
    );
  }

  return (
    <List>
      {files.map((file) => (
        <Paper key={file.id} variant="outlined" sx={{ mb: 1 }}>
          <ListItem
            secondaryAction={
              <Box>
                <IconButton 
                  edge="end" 
                  onClick={() => handleDownload(file.id, file.original_name)}
                  title="Download"
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  onClick={() => handleDelete(file.id)}
                  title="Delete"
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemIcon>
              <FileIcon />
            </ListItemIcon>
            <ListItemText
              primary={file.original_name}
              secondary={`${formatFileSize(file.size)} • Uploaded ${new Date(file.created_on).toLocaleDateString()}`}
            />
          </ListItem>
        </Paper>
      ))}
    </List>
  );
};

export default FileList; 