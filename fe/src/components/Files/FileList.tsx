import React from 'react';
import {
  List,
  ListItem,
  IconButton,
  Typography,
  Box,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { FileListProps } from '../../types/files';
import { useFileList } from '../../hooks/useFileList';

const FileList: React.FC<FileListProps> = ({
  files,
  taskId,
  onFileDeleted
}) => {
  const { formatFileSize } = useFileList(onFileDeleted);

  return (
    <List>
      {files.map((file) => (
        <ListItem
          key={file.id}
          secondaryAction={
            <Box>
              <Tooltip title="Download">
                <IconButton edge="end" aria-label="download">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onFileDeleted(file.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1">{file.original_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(file.size)} • Uploaded by {file.uploaded_by} on{' '}
              {new Date(file.created_on).toLocaleString()}
            </Typography>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default FileList; 