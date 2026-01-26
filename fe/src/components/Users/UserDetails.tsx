import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { getUserById } from '../../api/users';
import { UserDetailsState } from '../../types/user';

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<UserDetailsState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) throw new Error('User ID is required');
        const userData = await getUserById(parseInt(id));
        setState(prev => ({ ...prev, user: userData, loading: false }));
      } catch (error) {
        console.error('Failed to fetch user details', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to fetch user details',
          loading: false
        }));
      }
    };
    fetchUser();
  }, [id]);

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '.');
  };

  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {state.error}
      </Alert>
    );
  }

  if (!state.user) return null;

  return (
    <Paper sx={{ padding: 4, marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>{state.user?.login || 'Unknown User'}</Typography>
      <Typography variant="body1">ID: {state.user?.id || '-'}</Typography>
      <Typography variant="body1">Name: {state.user?.name || '-'}</Typography>
      <Typography variant="body1">Surname: {state.user?.surname || '-'}</Typography>
      <Typography variant="body1">Email: {state.user?.email || 'No email'}</Typography>
      <Typography variant="body1">Status: {state.user?.status_name || '-'}</Typography>
      <Typography variant="body1">Role: {state.user?.role_name || '-'}</Typography>
      <Typography variant="body1">Created on: {formatDate(state.user?.created_on)}</Typography>
      <Typography variant="body1">Last updated: {formatDate(state.user?.updated_on)}</Typography>
      <Typography variant="body1">Last login: {formatDate(state.user?.last_login)}</Typography>
    </Paper>
  );
};

export default UserDetails;
