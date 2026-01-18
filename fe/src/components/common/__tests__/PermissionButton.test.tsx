import React from 'react';
import { render, screen } from '@testing-library/react';
import PermissionButton from '../PermissionButton';
import { usePermission } from '../../../hooks/common/usePermission';

// Mock the usePermission hook
jest.mock('../../../hooks/common/usePermission');

describe('PermissionButton', () => {
  const mockUsePermission = usePermission as jest.Mock;
  const defaultProps = {
    requiredPermission: 'test.permission',
    children: 'Test Button'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with loading state', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: true });

    render(<PermissionButton {...defaultProps} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Test Button')).not.toBeInTheDocument();
  });

  it('renders button without loading state when showLoading is false', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: true });

    render(<PermissionButton {...defaultProps} showLoading={false} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders button with tooltip when permission is denied', () => {
    mockUsePermission.mockReturnValue({ hasPermission: false, loading: false });

    render(<PermissionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders enabled button when permission is granted', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: false });

    render(<PermissionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('respects disabled prop regardless of permissions', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: false });

    render(<PermissionButton {...defaultProps} disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('uses custom tooltip text', () => {
    mockUsePermission.mockReturnValue({ hasPermission: false, loading: false });
    const customTooltip = 'Custom tooltip text';

    render(<PermissionButton {...defaultProps} tooltipText={customTooltip} />);

    // Material-UI creates a tooltip element that's not immediately visible
    // We need to find the button first and verify the tooltip is properly set up
    const button = screen.getByRole('button');
    expect(button.parentElement).toHaveAttribute('aria-label', customTooltip);
  });

  it('forwards additional button props', () => {
    mockUsePermission.mockReturnValue({ hasPermission: true, loading: false });

    render(
      <PermissionButton
        {...defaultProps}
        data-testid="test-button"
        className="custom-class"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-testid', 'test-button');
    expect(button).toHaveClass('custom-class');
  });
});