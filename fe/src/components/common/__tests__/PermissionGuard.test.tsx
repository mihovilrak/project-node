import React from 'react';
import { render, screen } from '@testing-library/react';
import PermissionGuard from '../PermissionGuard';
import { usePermission } from '../../../hooks/common/usePermission';

// Mock the usePermission hook
jest.mock('../../../hooks/common/usePermission');

describe('PermissionGuard', () => {
  const mockUsePermission = usePermission as jest.Mock;
  const defaultProps = {
    requiredPermission: 'test.permission',
    children: <div>Protected Content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when loading and showLoading is true', () => {
    mockUsePermission.mockReturnValue({ hasPermission: false, loading: true });
    
    render(<PermissionGuard {...defaultProps} />);
    
    expect(screen.getByText('Loading permissions...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows children when loading but showLoading is false', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: true });
    
    render(<PermissionGuard {...defaultProps} showLoading={false} />);
    
    expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows fallback content when permission is denied', () => {
    mockUsePermission.mockReturnValue({ hasPermission: false, loading: false });
    const fallback = <div>Fallback Content</div>;
    
    render(<PermissionGuard {...defaultProps} fallback={fallback} />);
    
    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows default error message when no permission and no fallback', () => {
    mockUsePermission.mockReturnValue({ hasPermission: false, loading: false });
    
    render(<PermissionGuard {...defaultProps} />);
    
    expect(screen.getByText("You don't have permission to view this content")).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows children when permission is granted', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: false });
    
    render(<PermissionGuard {...defaultProps} />);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText("You don't have permission to view this content")).not.toBeInTheDocument();
  });

  it('checks if usePermission is called with correct permission', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: false });
    
    render(<PermissionGuard {...defaultProps} />);
    
    expect(mockUsePermission).toHaveBeenCalledWith('test.permission');
  });

  it('handles custom loading component when provided', () => {
    mockUsePermission.mockReturnValue({ hasPermission: false, loading: true });
    const loadingComponent = <div>Custom Loading...</div>;
    
    render(
      <PermissionGuard 
        {...defaultProps} 
        loadingComponent={loadingComponent}
      />
    );
    
    expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
  });
});