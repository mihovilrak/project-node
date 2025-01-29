import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectActions from '../ProjectActions';

describe('ProjectActions', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders no buttons when no permissions are granted', () => {
    render(
      <ProjectActions
        canEdit={false}
        canDelete={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('renders only edit button when canEdit is true', () => {
    render(
      <ProjectActions
        canEdit={true}
        canDelete={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('renders only delete button when canDelete is true', () => {
    render(
      <ProjectActions
        canEdit={false}
        canDelete={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders both buttons when all permissions are granted', () => {
    render(
      <ProjectActions
        canEdit={true}
        canDelete={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <ProjectActions
        canEdit={true}
        canDelete={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <ProjectActions
        canEdit={true}
        canDelete={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('renders edit button with correct color and margin', () => {
    render(
      <ProjectActions
        canEdit={true}
        canDelete={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByText('Edit').closest('button');
    expect(editButton).toHaveStyle({ marginRight: '8px' });
  });

  it('renders delete button with error color', () => {
    render(
      <ProjectActions
        canEdit={false}
        canDelete={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('Delete').closest('button');
    expect(deleteButton).toHaveClass('MuiButton-colorError');
  });
});