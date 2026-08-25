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

    // Find the Delete button by role and text
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('shows loading state during deletion', async () => {
    const onConfirmMock = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<DeleteConfirmDialog {...defaultProps} onConfirm={onConfirmMock} />);

    // Click delete button to trigger deletion
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const deletingButton = screen.getByRole('button', { name: /deleting/i });
    expect(cancelButton).toBeDisabled();
    expect(deletingButton).toBeDisabled();

    // Wait for deletion to complete (onConfirm resolves after 100ms)
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('buttons are enabled after deletion completes', async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const deleteBtn = screen.getByRole('button', { name: /delete/i });
      expect(cancelButton).not.toBeDisabled();
      expect(deleteBtn).not.toBeDisabled();
    });
  });

  test('closes dialog after successful deletion', async () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});