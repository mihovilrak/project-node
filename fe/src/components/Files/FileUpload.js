import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  LinearProgress, 
  Typography, 
  Alert,
  IconButton
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { uploadTaskFile } from '../../api/files';

const FileUpload = ({ taskId, onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadedFile = await uploadTaskFile(taskId, formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(progress);
      });
      
      onFileUploaded(uploadedFile);
      setProgress(100);
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <Box>
      {error && (
        <Alert 
          severity="error" 
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadIcon />}
        disabled={uploading}
      >
        Upload File
        <input
          type="file"
          hidden
          onChange={handleFileSelect}
          accept="*/*"
        />
      </Button>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary">
            {progress}% uploaded
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload; 