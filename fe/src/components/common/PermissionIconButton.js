import React from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { usePermission } from '../../hooks/usePermission';

const PermissionIconButton = ({ 
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
      <IconButton {...props} disabled>
        <CircularProgress size={20} />
      </IconButton>
    );
  }

  if (!canAccess) {
    return (
      <Tooltip title={tooltipText} placement={placement}>
        <span>
          <IconButton {...props} disabled>
            {children}
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return <IconButton {...props}>{children}</IconButton>;
};

export default PermissionIconButton; 