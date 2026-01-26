import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { getUsers, deleteUser } from '../../api/users';
import { User } from '../../types/user';
import FilterPanel from '../common/FilterPanel';
import { FilterValues } from '../../types/filterPanel';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userList = await getUsers();
      setUsers(userList || []);
    } catch (error: any) {
      console.error('Failed to fetch users', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to load users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      await fetchUsers();
      // Dispatch custom event to notify other components (e.g., UserManager in Settings)
      window.dispatchEvent(new CustomEvent('userDeleted', { detail: { userId: userToDelete.id } }));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete user', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to delete user. Please try again.';
      setDeleteError(errorMessage);
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

  const filterOptions = {
    showSearch: true
  };

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

      <Grid container spacing={2} marginTop={2}>
        {filteredUsers.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Typography>No users found.</Typography>
          </Grid>
        ) : (
          filteredUsers.map(user => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user?.id}>
              <Card>
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
            </Grid>
          ))
        )}
      </Grid>

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
