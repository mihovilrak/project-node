import React from 'react';
import {
  List,
  ListItem,
  IconButton,
  Typography,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { FileListProps } from '../../types/files';
import { useFileList } from '../../hooks/useFileList';
import { downloadFile } from '../../api/files';

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
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <ListItemText
            primary={decodeURIComponent(escape(file.original_name))}
            secondary={
              <>
                <Typography variant="caption" display="block">
                  Uploaded by: {file.uploaded_by || 'Unknown'}
                </Typography>
                <Typography variant="caption" display="block">
                  Uploaded on: {new Date(file.created_on).toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Size: {formatFileSize(file.size)}
                </Typography>
              </>
            }
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={() => downloadFile(taskId, file.id)}
            >
              <DownloadIcon />
            </IconButton>
            <IconButton
              edge="end"
              onClick={() => onFileDeleted(file.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default FileList;