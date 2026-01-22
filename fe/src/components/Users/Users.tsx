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
  SelectChangeEvent
} from '@mui/material';
import { getUsers, deleteUser } from '../../api/users';
import { User } from '../../types/user';
import FilterPanel from '../common/FilterPanel';
import { FilterValues } from '../../types/filterPanel';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterValues>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }
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
          user.name.toLowerCase().includes(searchTerm) ||
          user.surname.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const nameA = `${a.name} ${a.surname}`;
      const nameB = `${b.name} ${b.surname}`;
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  if (loading) return <CircularProgress />;

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
        {filteredUsers.map(user => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{user.name} {user.surname}</Typography>
                <Typography variant="body2">Email: {user.email}</Typography>
                <Typography variant="body2">Role: {user.role_name}</Typography>
                <Box marginTop={2}>
                  <Button variant="contained" color="primary" onClick={() => navigate(`/users/${user.id}`)} data-testid="view-user-btn">View</Button>
                  <Button variant="contained" color="warning" onClick={() => navigate(`/users/${user.id}/edit`)} sx={{ ml: 1 }} data-testid="edit-user-btn">Edit</Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(user.id)} sx={{ ml: 1 }} data-testid={`delete-user-${user.id}`}>Delete</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Users;
