import React from 'react';
import { Button, Tooltip, CircularProgress } from '@mui/material';
import { usePermission } from '../../hooks/usePermission';

const PermissionButton = ({ 
  requiredPermission, 
  children, 
  tooltipText = "You don't have permission for this action",
  showLoading = true,
  placement = "top",
  ...props 
}) => {
  const { canAccess, isLoading } = usePermission(requiredPermission);

  if (isLoading && showLoading) {
    return (
      <Button {...props} disabled>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        {children}
      </Button>
    );
  }

  if (!canAccess) {
    return (
      <Tooltip title={tooltipText} placement={placement}>
        <span>
          <Button {...props} disabled>
            {children}
          </Button>
        </span>
      </Tooltip>
    );
  }

  return <Button {...props}>{children}</Button>;
};

export default PermissionButton; 