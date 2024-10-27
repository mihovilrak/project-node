// src/components/Users/UserDetails.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '../../api/users';
import { Box, Typography, Paper } from '@mui/material';

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(id);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user details', error);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) return <Typography>Loading user details...</Typography>;

  return (
    <Paper sx={{ padding: 4, marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>{user.login}</Typography>
      <Typography variant="body1">ID: {user.id}</Typography>
      <Typography variant="body1">Name: {user.name}</Typography>
      <Typography variant="body1">Surname: {user.surname}</Typography>
      <Typography variant="body1">Email: {user.email}</Typography>
      <Typography variant="body1">Status: {user.status}</Typography>
      <Typography variant="body1">Role: {user.role}</Typography>
      <Typography variant="body1">Created on: {user.created_on}</Typography>
      <Typography variant="body1">Last updated: {user.updated_on}</Typography>
      <Typography variant="body1">Last login: {user.last_login}</Typography>
    </Paper>
  );
};

export default UserDetails;
