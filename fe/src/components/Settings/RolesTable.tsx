import React from 'react';
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
  Tooltip
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { RolesTableProps } from '../../types/settings';

const RolesTable: React.FC<RolesTableProps> = ({ 
  roles, 
  onEdit, 
  onDelete, 
  loading 
}) => {
  if (loading) {
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
            <TableCell>Permissions</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell>
                <Tooltip title={role.permissions.map(p => p.name).join(', ')}>
                  <Chip
                    label={`${role.permissions.length} permissions`}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              </TableCell>
              <TableCell>
                <Chip
                  label={role.active ? 'Active' : 'Inactive'}
                  color={role.active ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEdit(role)} size="small">
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

export default RolesTable; 