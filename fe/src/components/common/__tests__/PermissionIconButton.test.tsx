import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PermissionIconButton from '../PermissionIconButton';
import { usePermission } from '../../../hooks/common/usePermission';

// Mock the usePermission hook
jest.mock('../../../hooks/common/usePermission');

describe('PermissionIconButton', () => {
  const mockUsePermission = usePermission as jest.Mock;
  const mockOnClick = jest.fn();
  
  const defaultProps = {
    requiredPermission: 'test.permission',
    children: <span>Icon</span>,
    onClick: mockOnClick
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when loading and showLoading is true', () => {
    mockUsePermission.mockReturnValue({ hasPermission: false, loading: true });
    
    render(<PermissionIconButton {...defaultProps} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Icon')).not.toBeInTheDocument();
  });

  it('shows children when loading but showLoading is false', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: true });
    
    render(<PermissionIconButton {...defaultProps} showLoading={false} />);
    
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('shows tooltip when permission is denied', () => {
    mockUsePermission.mockReturnValue({ hasPermission: false, loading: false });
    
    render(<PermissionIconButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.parentElement).toHaveAttribute('aria-label', "You don't have permission for this action");
  });

  it('shows custom tooltip text when provided', () => {
    mockUsePermission.mockReturnValue({ hasPermission: false, loading: false });
    
    render(<PermissionIconButton {...defaultProps} tooltipText="Custom tooltip" />);
    
    expect(screen.getByRole('button').parentElement).toHaveAttribute('aria-label', 'Custom tooltip');
  });

  it('enables button when permission is granted', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: false });
    
    render(<PermissionIconButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('handles click events when enabled', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: false });
    
    render(<PermissionIconButton {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('does not handle click events when disabled', () => {
    mockUsePermission.mockReturnValue({ hasPermission: false, loading: false });
    
    render(<PermissionIconButton {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('respects additional disabled prop', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: false });
    
    render(<PermissionIconButton {...defaultProps} disabled />);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('checks if usePermission is called with correct permission', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: false });
    
    render(<PermissionIconButton {...defaultProps} />);
    
    expect(mockUsePermission).toHaveBeenCalledWith('test.permission');
  });
});