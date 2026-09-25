import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import UserTable from './UserTable';
import UserDialog from './UserDialog';
import { getUsers } from '../../api/users';
import { User } from '../../types/user';
import { useAsyncResource } from '../../hooks/common/useAsyncResource';
import { useOnLookupInvalidate } from '../../context/LookupsContext';
import { useCurrentUser } from '../../context/AuthContext';

const UserManager: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const currentUser = useCurrentUser();
  const {
    data: users,
    loading,
    error,
    refetch,
  } = useAsyncResource<User[]>(
    async (signal) => (await getUsers(undefined, { all: true }, signal)) || [],
    [],
    { initialData: [], errorMessage: 'Failed to fetch users' },
  );
  const { invalidate } = useOnLookupInvalidate('users', refetch);

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
    invalidate('users');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
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

      {/* Refetches keep the table mounted so paging survives a save. */}
      {loading && users.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserTable
          users={users}
          onEditUser={handleEditUser}
          onUserDeleted={handleUserSaved}
          onUserUpdated={handleUserSaved}
          currentUserId={currentUser?.id}
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
