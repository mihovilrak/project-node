import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { getTaskTypes } from '../../api/taskTypes';
import { TaskType, TaskTypesTableProps } from '../../types/settings';

const TaskTypesTable: React.FC<TaskTypesTableProps> = ({ 
  taskTypes: propTaskTypes,
  onEdit,
  onDelete,
  loading: propLoading 
}) => {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propTaskTypes) {
      setTaskTypes(propTaskTypes);
      setLoading(false);
    }
  }, [propTaskTypes]);

  if (loading || propLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Color</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {taskTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell>{type.name}</TableCell>
              <TableCell>{type.description}</TableCell>
              <TableCell>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: type.color,
                    borderRadius: 1
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={type.active ? 'Active' : 'Inactive'}
                  color={type.active ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(type)} size="small">
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskTypesTable; 