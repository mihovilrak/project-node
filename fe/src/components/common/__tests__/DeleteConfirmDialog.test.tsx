import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteConfirmDialog from '../DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props when open', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('renders with custom title and content', () => {
    const customProps = {
      ...defaultProps,
      title: 'Custom Title',
      content: 'Custom Content'
    };

    render(<DeleteConfirmDialog {...customProps} />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  test('calls onClose when Cancel button is clicked', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onConfirm when Delete button is clicked', async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Delete'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('shows loading state during deletion', async () => {
    const onConfirmMock = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<DeleteConfirmDialog {...defaultProps} onConfirm={onConfirmMock} />);

    fireEvent.click(screen.getByText('Delete'));

    // Check loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Delete')).toBeDisabled();

    // Wait for deletion to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('buttons are enabled after deletion completes', async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Cancel')).not.toBeDisabled();
      expect(screen.getByText('Delete')).not.toBeDisabled();
    });
  });

  test('closes dialog after successful deletion', async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});