import React from 'react';
import {
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { usePermission } from '../../hooks/common/usePermission';
import { PermissionIconButtonProps } from '../../types/common';

const PermissionIconButton: React.FC<PermissionIconButtonProps> = ({ 
  requiredPermission, 
  children, 
  tooltipText = "You don't have permission for this action",
  showLoading = true,
  placement = "top",
  disabled,
  ...props 
}) => {
  const { hasPermission, loading } = usePermission(requiredPermission);

  const isDisabled = loading || disabled || !hasPermission;

  const button = (
    <IconButton
      {...props}
      disabled={isDisabled}
    >
      {showLoading && loading ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        children
      )}
    </IconButton>
  );

  if (!hasPermission && !loading) {
    return (
      <Tooltip title={tooltipText} placement={placement}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
};

export default PermissionIconButton;
