import { ReactNode } from 'react';
import {
  ButtonProps,
  IconButtonProps,
  TooltipProps
} from '@mui/material';

// Permission-aware button props
export interface PermissionButtonProps extends Omit<ButtonProps, 'children'> {
    requiredPermission: string;
    children: ReactNode;
    tooltipText?: string;
    showLoading?: boolean;
    placement?: TooltipProps['placement'];
}

// Permission-aware icon button props
export interface PermissionIconButtonProps extends Omit<IconButtonProps, 'children'> {
    requiredPermission: string;
    children: ReactNode;
    tooltipText?: string;
    showLoading?: boolean;
    placement?: TooltipProps['placement'];
}

// Permission guard component props
export interface PermissionGuardProps {
  requiredPermission: string;
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
  showError?: boolean;
  errorMessage?: string;
  loadingComponent?: ReactNode;
}

// Delete confirmation dialog props
export interface DeleteConfirmDialogProps {
    open: boolean;
    title?: string;
    content?: string;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    error?: string;
}

// Use permission hook result
export interface UsePermissionResult {
  hasPermission: boolean;
  loading: boolean;
}
