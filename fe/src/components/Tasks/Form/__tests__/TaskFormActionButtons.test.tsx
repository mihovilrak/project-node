import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFormActionButtons } from '../TaskFormActionButtons';

describe('TaskFormActionButtons', () => {
  const mockHistoryBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.history.back = mockHistoryBack;
  });

  it('renders both buttons', () => {
    render(<TaskFormActionButtons isEditing={false} />);
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('shows "Update Task" text when isEditing is true', () => {
    render(<TaskFormActionButtons isEditing={true} />);
    
    expect(screen.getByText('Update Task')).toBeInTheDocument();
    expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
  });

  it('shows "Create Task" text when isEditing is false', () => {
    render(<TaskFormActionButtons isEditing={false} />);
    
    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.queryByText('Update Task')).not.toBeInTheDocument();
  });

  it('calls window.history.back when Cancel is clicked', () => {
    render(<TaskFormActionButtons isEditing={false} />);
    
    const cancelButton = screen.getByText('Cancel');
    userEvent.click(cancelButton);
    
    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  it('has correct button attributes and styling', () => {
    render(<TaskFormActionButtons isEditing={false} />);
    
    const cancelButton = screen.getByText('Cancel');
    const submitButton = screen.getByText('Create Task');

    expect(cancelButton).toHaveAttribute('type', 'button');
    expect(cancelButton).toHaveAttribute('color', 'inherit');
    
    expect(submitButton).toHaveAttribute('type', 'submit');
    expect(submitButton).toHaveClass('MuiButton-contained');
    expect(submitButton).toHaveAttribute('color', 'primary');
  });
});