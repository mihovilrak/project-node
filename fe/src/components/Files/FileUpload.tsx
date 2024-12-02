import React from 'react';
import {
  Button,
  Box,
  LinearProgress,
  Typography,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FileUploadProps } from '../../types/files';
import { useFileUpload } from '../../hooks/useFileUpload';

const FileUpload: React.FC<FileUploadProps> = ({
  taskId,
  onFileUploaded
}) => {
  const {
    uploading,
    progress,
    error,
    fileInputRef,
    handleFileChange,
    setError
  } = useFileUpload(taskId, onFileUploaded);

  return (
    <Box>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
        accept="*/*"
      />
      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        sx={{ mb: 2 }}
      >
        Upload File
      </Button>

      {uploading && (
        <Box sx={{ mt: 2, width: '100%' }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {progress}% uploaded
          </Typography>
        </Box>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload; 