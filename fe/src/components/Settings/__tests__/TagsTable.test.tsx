import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TagsTable from '../TagsTable';
import { Tag } from '../../../types/tag';

const tagMeta = { description: '', created_by: 1, created_on: '2026-01-01' };

const tags: Tag[] = [
  { id: 1, name: 'bug', color: '#ff0000', active: true, ...tagMeta },
  { id: 2, name: 'legacy', color: '#00ff00', active: false, ...tagMeta },
];

describe('TagsTable', () => {
  const props = {
    tags,
    onEdit: jest.fn(),
    onDelete: jest.fn().mockResolvedValue(undefined),
    onReactivate: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('shows an empty state', () => {
    render(<TagsTable {...props} tags={[]} />);
    expect(screen.getByText('No tags found')).toBeInTheDocument();
  });

  it('shows a spinner while loading', () => {
    render(<TagsTable {...props} loading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('lists tags with their status', () => {
    render(<TagsTable {...props} />);
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('edits an active tag', () => {
    render(<TagsTable {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit tag bug' }));
    expect(props.onEdit).toHaveBeenCalledWith(tags[0]);
  });

  it('deletes a tag after confirmation', async () => {
    render(<TagsTable {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete tag bug' }));
    expect(props.onDelete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(props.onDelete).toHaveBeenCalledWith(1));
  });

  it('reactivates an inactive tag', () => {
    render(<TagsTable {...props} />);
    expect(
      screen.queryByRole('button', { name: 'Edit tag legacy' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Reactivate tag legacy' }),
    );
    expect(props.onReactivate).toHaveBeenCalledWith(tags[1]);
  });

  it('disables actions without permission', () => {
    render(<TagsTable {...props} canManage={false} />);
    expect(screen.getByRole('button', { name: 'Edit tag bug' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Reactivate tag legacy' }),
    ).toBeDisabled();
  });
});
