import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Tag } from '../../types/tag';
import { TagsTableProps } from '../../types/setting';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

const TagsTable: React.FC<TagsTableProps> = ({
  tags,
  onEdit,
  onDelete,
  onReactivate,
  loading,
  canManage = true,
}) => {
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No tags found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Chip
                      label={tag.name}
                      size="small"
                      sx={{ backgroundColor: tag.color, color: '#fff' }}
                    />
                  </TableCell>
                  <TableCell>{tag.color}</TableCell>
                  <TableCell>
                    <Chip
                      label={tag.active ? 'Active' : 'Inactive'}
                      color={tag.active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {tag.active ? (
                      <>
                        <IconButton
                          onClick={() => onEdit(tag)}
                          size="small"
                          disabled={!canManage}
                          aria-label={`Edit tag ${tag.name}`}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => setTagToDelete(tag)}
                          size="small"
                          color="error"
                          disabled={!canManage}
                          aria-label={`Delete tag ${tag.name}`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => onReactivate(tag)}
                        disabled={!canManage}
                        aria-label={`Reactivate tag ${tag.name}`}
                      >
                        Reactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <DeleteConfirmDialog
        open={Boolean(tagToDelete)}
        title="Delete tag"
        content={`Delete the tag "${tagToDelete?.name ?? ''}"? It will be removed from task tag lists until reactivated.`}
        onClose={() => setTagToDelete(null)}
        onConfirm={async () => {
          if (tagToDelete) await onDelete(tagToDelete.id);
        }}
      />
    </>
  );
};

export default TagsTable;
