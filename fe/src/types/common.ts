import { ReactNode } from 'react';
import {
  ButtonProps,
  IconButtonProps,
  TooltipProps,
  SxProps,
  Theme
} from '@mui/material';
import { ApiError } from './api';

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

// Base dialog props
export interface BaseDialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
}

// Data table column definition
export interface DataTableColumn<T> {
    id: keyof T | string;
    label: string;
    minWidth?: number;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string | ReactNode;
    sortable?: boolean;
    hidden?: boolean;
}

// Data table props
export interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    loading?: boolean;
    error?: string;
    total?: number;
    page?: number;
    rowsPerPage?: number;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    onSort?: (field: keyof T, order: 'asc' | 'desc') => void;
    selected?: number[];
    onSelect?: (selected: number[]) => void;
    actions?: ReactNode;
    sx?: SxProps<Theme>;
}

// Error boundary props and state
export interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

// Loading overlay props
export interface LoadingOverlayProps {
    loading: boolean;
    text?: string;
    children: ReactNode;
}

// Form error handler
export interface FormError {
    field: string;
    message: string;
}

export type FormErrorHandler = (error: ApiError) => FormError[];

// Status badge props
export interface StatusBadgeProps {
    label: string;
    color?: string;
    icon?: ReactNode;
    size?: 'small' | 'medium' | 'large';
}

// Search input props
export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    fullWidth?: boolean;
}

// Date range picker props
export interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    onStartDateChange: (date: Date | null) => void;
    onEndDateChange: (date: Date | null) => void;
    minDate?: Date;
    maxDate?: Date;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
}

// File size formatter options
export interface FileSizeFormatterOptions {
    precision?: number;
    locale?: string;
    binary?: boolean;
}

// Use permission hook result
export interface UsePermissionResult {
  hasPermission: boolean;
  loading: boolean;
}

// Common utility types
export type ID = number | string;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ValueOf<T> = T[keyof T];
