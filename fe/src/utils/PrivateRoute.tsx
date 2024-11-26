import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface PrivateRouteProps {
  element?: React.ReactElement;
  requiredPermission?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Component, requiredPermission }) => {
  const { currentUser, hasPermission, permissionsLoading } = useAuth();

  if (permissionsLoading) {
    return (
      <Box sx={{ display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" />;
  }

  return Component ? Component : <Outlet />;
};

export default PrivateRoute; 