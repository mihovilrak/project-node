import { ReactNode, Dispatch, SetStateAction } from 'react';
import { ButtonProps, TooltipProps } from '@mui/material';

/**
 * Specify properties for a permission-gated button including the required permission, button content, optional tooltip text, an optional loading state, and tooltip placement.
 */
export interface PermissionButtonProps extends Omit<ButtonProps, 'children'> {
  requiredPermission: string;
  children: ReactNode;
  tooltipText?: string;
  showLoading?: boolean;
  placement?: TooltipProps['placement'];
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

/**
 * Configure an asynchronous resource by supplying its initial data and optional controls for enabling and custom error messaging.
 */
export interface AsyncResourceOptions<T> {
  initialData: T;
  /** When false the fetcher is skipped and `loading` stays false. */
  enabled?: boolean;
  errorMessage?: string;
}

export interface AsyncResource<T> {
  data: T;
  setData: Dispatch<SetStateAction<T>>;
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  refetch: () => Promise<void>;
}
