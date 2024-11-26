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
      return;
    }

    const fetchTaskTypes = async (): Promise<void> => {
      try {
        const response = await getTaskTypes();
        if (response) {
          setTaskTypes(response.map((type: any) => ({
            ...type,
            is_active: type.active || type.is_active || false
          })));
        } else {
          setError('No task types data received');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch task types');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskTypes();
  }, [propTaskTypes]);

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, color: 'error.main' }}>
        Error: {error}
      </Box>
    );
  }

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