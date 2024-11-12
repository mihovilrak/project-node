import React from 'react';
import { usePermission } from '../../hooks/usePermission';
import { CircularProgress, Alert, Box } from '@mui/material';

const PermissionGuard = ({ 
  requiredPermission, 
  children,
  fallback = null,
  showLoading = true,
  showError = false,
  errorMessage = "You don't have permission to access this content",
  loadingComponent = null
}) => {
  const { canAccess, isLoading } = usePermission(requiredPermission);

  if (isLoading && showLoading) {
    return loadingComponent || (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!canAccess) {
    if (showError) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {errorMessage}
        </Alert>
      );
    }
    return fallback;
  }

  return children;
};

export default PermissionGuard; 