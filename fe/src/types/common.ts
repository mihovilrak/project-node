import { ReactNode } from 'react';
import {
  ButtonProps,
  IconButtonProps,
  TooltipProps
} from '@mui/material';

export interface PermissionButtonProps extends Omit<ButtonProps, 'children'> {
    requiredPermission: string;
    children: ReactNode;
    tooltipText?: string;
    showLoading?: boolean;
    placement?: TooltipProps['placement'];
}

export interface PermissionIconButtonProps extends Omit<IconButtonProps, 'children'> {
    requiredPermission: string;
    children: ReactNode;
    tooltipText?: string;
    showLoading?: boolean;
    placement?: TooltipProps['placement'];
}

export interface PermissionGuardProps {
  requiredPermission: string;
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
  showError?: boolean;
  errorMessage?: string;
  loadingComponent?: ReactNode;
}

export interface DeleteConfirmDialogProps {
    open: boolean;
    title?: string;
    content?: string;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    error?: string;
}

export interface UsePermissionResult {
  hasPermission: boolean;
  loading: boolean;
}
