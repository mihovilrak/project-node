import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { getUsers, deleteUser } from '../../api/users';
import { User } from '../../types/user';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchUsers();
  }, []);

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

  if (loading) return <CircularProgress />;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/users/new')}>Add New User</Button>
      <Grid container spacing={2} marginTop={2}>
        {users.map(user => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{user.name} {user.surname}</Typography>
                <Typography variant="body2">Email: {user.email}</Typography>
                <Typography variant="body2">Role: {user.role}</Typography>
                <Box marginTop={2}>
                  <Button variant="contained" color="primary" onClick={() => navigate(`/users/${user.id}`)}>View</Button>
                  <Button variant="contained" color="warning" onClick={() => navigate(`/users/${user.id}/edit`)} sx={{ ml: 1 }}>Edit</Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(user.id)} sx={{ ml: 1 }}>Delete</Button>
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