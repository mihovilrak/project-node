import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskFormActionButtons } from '../TaskFormActionButtons';

describe('TaskFormActionButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both buttons', () => {
    render(<TaskFormActionButtons isEditing={false} />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('shows "Update Task" text when isEditing is true', () => {
    render(<TaskFormActionButtons isEditing={true} />);
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create task/i })).not.toBeInTheDocument();
  });

  it('shows "Create Task" text when isEditing is false', () => {
    render(<TaskFormActionButtons isEditing={false} />);
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /update task/i })).not.toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = jest.fn();
    render(<TaskFormActionButtons isEditing={false} onCancel={onCancel} />);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('has correct button attributes and styling', () => {
    render(<TaskFormActionButtons isEditing={false} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const submitButton = screen.getByRole('button', { name: /create task/i });

    expect(cancelButton).toHaveAttribute('type', 'button');
    // Instead of checking for color attribute, check for MUI class (color is applied via class, not DOM attribute)
    expect(cancelButton.className).toMatch(/MuiButton-root/);

    expect(submitButton).toHaveAttribute('type', 'submit');
    expect(submitButton.className).toMatch(/MuiButton-contained/);
    expect(submitButton.className).toMatch(/MuiButton-containedPrimary/);
  });
});