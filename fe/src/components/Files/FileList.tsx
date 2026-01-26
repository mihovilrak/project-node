import React from 'react';
import {
  List,
  ListItem,
  IconButton,
  Typography,
  ListItemText,
  Link,
  ListItemSecondaryAction,
  Box,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { FileListProps } from '../../types/file';
import { useFileList } from '../../hooks/file/useFileList';
import { downloadFile } from '../../api/files';
import { Link as RouterLink } from 'react-router-dom';

const FileList: React.FC<FileListProps> = ({
  files,
  taskId,
  onFileDeleted
}) => {
  const { formatFileSize } = useFileList(onFileDeleted);

  if (files.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No files uploaded yet
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {files.map((file) => (
        <ListItem
          key={file?.id}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <InsertDriveFileIcon sx={{ mr: 2, color: 'primary.main' }} />
            <ListItemText
              primary={
                <Typography variant="body1" component="div">
                  {file?.original_name ? decodeURIComponent(escape(file.original_name)) : 'Unknown file'}
                </Typography>
              }
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                <Box component="div">
                  <Typography variant="caption" component="div" display="block">
                    Uploaded by: {file?.user_id ? (
                      <Link
                        component={RouterLink}
                        to={`/users/${file.user_id}`}
                        color="primary"
                      >
                        {file?.uploaded_by || 'Unknown'}
                      </Link>
                    ) : (
                      file?.uploaded_by || 'Unknown'
                    )}
                  </Typography>
                  <Typography variant="caption" component="div" display="block">
                    Size: <span data-testid="file-size">{formatFileSize(file?.size || 0)}</span>
                  </Typography>
                  <Typography variant="caption" component="div" display="block">
                    Uploaded on: {file?.uploaded_on ? new Date(file.uploaded_on).toLocaleString() : 'Unknown'}
                  </Typography>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title="Download">
                <IconButton
                  edge="end"
                  aria-label="download"
                  onClick={() => file?.id && taskId && downloadFile(taskId, file.id)}
                  sx={{ mr: 1 }}
                  disabled={!file?.id || !taskId}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => file?.id && onFileDeleted(file.id)}
                  disabled={!file?.id}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default FileList;