import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { getUsers, deleteUser, getUserStatuses } from '../../api/users';
import { User } from '../../types/user';
import FilterPanel from '../common/FilterPanel';
import { FilterValues } from '../../types/filterPanel';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async (currentFilters?: FilterValues) => {
    try {
      setLoading(true);
      setError(null);

      const whereParams: Record<string, number> = {};
      if (currentFilters?.status_id != null && currentFilters?.status_id !== '') {
        whereParams.status_id = Number(currentFilters.status_id);
      }
      const userList = await getUsers(Object.keys(whereParams).length ? whereParams : undefined);
      setUsers(userList || []);
    } catch (error: unknown) {
      logger.error('Failed to fetch users', error);
      setError(getApiErrorMessage(error, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(filters);
    const loadStatuses = async () => {
      try {
        const data = await getUserStatuses().catch(() => []);
        setStatuses(data);
      } catch {
        setStatuses([]);
      }
    };
    loadStatuses();
  }, [fetchUsers]);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeleteError(null);
      await deleteUser(userToDelete.id);
      // Refresh users list from API to ensure consistency
      await fetchUsers(filters);
      // Dispatch custom event to notify other components (e.g., UserManager in Settings)
      window.dispatchEvent(new CustomEvent('userDeleted', { detail: { userId: userToDelete.id } }));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: unknown) {
      logger.error('Failed to delete user', error);
      setDeleteError(getApiErrorMessage(error, 'Failed to delete user. Please try again.'));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleSortChange = (event: SelectChangeEvent<'asc' | 'desc'>) => {
    setSortOrder(event.target.value as 'asc' | 'desc');
  };

  const filterOptions = useMemo(() => ({
    search: true,
    statuses: statuses.map((s) => ({ id: s.id, name: s.name }))
  }), [statuses]);

  const filteredUsers = users
    .filter(user => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          user?.name?.toLowerCase().includes(searchTerm) ||
          user?.surname?.toLowerCase().includes(searchTerm) ||
          user?.email?.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const nameA = `${a?.name || ''} ${a?.surname || ''}`.trim();
      const nameB = `${b?.name || ''} ${b?.surname || ''}`.trim();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" data-testid="users-error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/users/new')} data-testid="add-user-btn">
          Add New User
        </Button>
        <Select
          value={sortOrder}
          onChange={handleSortChange}
          size="small"
          sx={{ minWidth: 100, ml: 2 }}
          inputProps={{ 'data-testid': 'sort-select' }}
        >
          <MenuItem value="asc">A-Z</MenuItem>
          <MenuItem value="desc">Z-A</MenuItem>
        </Select>
      </Box>

      <FilterPanel
        type="users"
        filters={filters}
        options={filterOptions}
        onFilterChange={handleFilterChange}
      />

      <Box marginTop={2} sx={{ height: 600 }}>
        {filteredUsers.length === 0 ? (
          <Typography>No users found.</Typography>
        ) : (
          <List
            height={600}
            itemCount={filteredUsers.length}
            itemSize={200}
            width="100%"
            itemData={filteredUsers}
          >
            {({ index, style, data }) => {
              const user = data[index];
              return (
                <div style={style}>
                  <Box sx={{ py: 1, px: 0.5 }}>
                    <Card data-testid={`user-card-${user?.id}`}>
                      <CardContent>
                        <Typography variant="h6">{user?.name || ''} {user?.surname || ''}</Typography>
                        <Typography variant="body2">Email: {user?.email || 'No email'}</Typography>
                        <Typography variant="body2">Role: {user?.role_name || 'No Role'}</Typography>
                        <Box marginTop={2}>
                          <Button variant="contained" color="primary" onClick={() => navigate(`/users/${user?.id}`)} data-testid="view-user-btn">View</Button>
                          <Button variant="contained" color="warning" onClick={() => navigate(`/users/${user?.id}/edit`)} sx={{ ml: 1 }} data-testid="edit-user-btn">Edit</Button>
                          <Button variant="contained" color="error" onClick={() => handleDeleteClick(user)} sx={{ ml: 1 }} data-testid={`delete-user-${user?.id}`}>Delete</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </div>
              );
            }}
          </List>
        )}
      </Box>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        content={`Are you sure you want to delete user ${userToDelete?.name} ${userToDelete?.surname}? This action cannot be undone.`}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
      {deleteError && deleteDialogOpen && (
        <Alert severity="error" sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
          {deleteError}
        </Alert>
      )}
    </Box>
  );
};

export default Users;
