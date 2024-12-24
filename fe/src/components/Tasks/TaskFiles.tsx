import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import FileUpload from '../Files/FileUpload';
import FileList from '../Files/FileList';
import { TaskFile } from '../../types/files';
import {
  getTaskFiles,
  deleteFile,
  downloadFile
} from '../../api/files';

interface TaskFilesProps {
  taskId: number;
  onFileUploaded: (file: TaskFile) => void;
  onFileDeleted: (fileId: number) => void;
}

const TaskFiles: React.FC<TaskFilesProps> = ({ taskId, onFileUploaded, onFileDeleted }) => {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<TaskFile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [taskId]);

  const fetchFiles = async () => {
    try {
      const filesData = await getTaskFiles(taskId);
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const handleDownload = async (file: TaskFile) => {
    try {
      await downloadFile(taskId, file.id);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleDeleteClick = (file: TaskFile) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedFile) {
      try {
        await deleteFile(taskId, selectedFile.id);
        setFiles(files.filter(f => f.id !== selectedFile.id));
        onFileDeleted(selectedFile.id);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
    setDeleteDialogOpen(false);
    setSelectedFile(null);
  };

  return (
    <Paper sx={{ mt: 3, p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Files ({files.length})
      </Typography>
      
      <FileUpload 
        taskId={taskId} 
        onFileUploaded={(file) => {
          setFiles(prev => [...prev, file]);
          onFileUploaded(file);
        }} 
      />
      
      <Box sx={{ mt: 2 }}>
        <FileList 
          files={files} 
          taskId={taskId}
          onFileDeleted={onFileDeleted}
        />
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedFile?.original_name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TaskFiles; 