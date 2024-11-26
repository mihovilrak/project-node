import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import UserTable from './UserTable';
import UserDialog from './UserDialog';
import { getUsers } from '../../api/users';
import { User } from '../../types/user';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = (): void => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User): void => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDialogClose = (): void => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleUserSaved = (): void => {
    handleDialogClose();
    fetchUsers();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateUser}
        >
          Create User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserTable 
          users={users} 
          onEditUser={handleEditUser}
          onUserDeleted={handleUserSaved}
        />
      )}

      <UserDialog
        open={dialogOpen}
        user={selectedUser}
        onClose={handleDialogClose}
        onUserSaved={handleUserSaved}
      />
    </Paper>
  );
};

export default UserManager; 