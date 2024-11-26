import React, { useState, useRef } from 'react';
import {
  Button,
  Box,
  LinearProgress,
  Typography,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FileUploadProps, TaskFile } from '../../types/files';
import { uploadFile } from '../../api/files';
import { AxiosProgressEvent } from 'axios';

const FileUpload: React.FC<FileUploadProps> = ({
  taskId,
  onFileUploaded
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('task_id', taskId.toString());

      const progressCallback = (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentage);
        }
      };

      const response = await uploadFile(taskId, formData, progressCallback);

      if (response.data) {
        onFileUploaded(response.data as TaskFile);
      }
      setProgress(0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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