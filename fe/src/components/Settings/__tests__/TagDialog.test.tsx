import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TagDialog from '../TagDialog';

jest.mock('mui-color-input', () => ({
  MuiColorInput: ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
  }) => (
    <input
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('TagDialog', () => {
  const onClose = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('creates a tag with a trimmed name', async () => {
    onSave.mockResolvedValueOnce(undefined);
    render(<TagDialog open onClose={onClose} onSave={onSave} />);

    expect(screen.getByText('Create Tag')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: '  ui  ' },
    });
    fireEvent.change(screen.getByLabelText('Color'), {
      target: { value: '#00ff00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ name: 'ui', color: '#00ff00' }),
    );
  });

  it('edits an existing tag', async () => {
    onSave.mockResolvedValueOnce(undefined);
    render(
      <TagDialog
        open
        tag={{
          id: 4,
          name: 'bug',
          color: '#ff0000',
          active: true,
          description: '',
          created_by: 1,
          created_on: '2026-01-01',
        }}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    expect(screen.getByText('Edit Tag')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        id: 4,
        name: 'bug',
        color: '#ff0000',
      }),
    );
  });

  it('validates the name and colour', () => {
    render(<TagDialog open onClose={onClose} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByText('Name is required')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: 'ui' },
    });
    fireEvent.change(screen.getByLabelText('Color'), {
      target: { value: 'red' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(
      screen.getByText('Color must be a hex value like #2196f3'),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows API errors', async () => {
    onSave.mockRejectedValueOnce({
      response: { data: { error: 'Tag name already exists' } },
    });
    render(<TagDialog open onClose={onClose} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: 'bug' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(
      await screen.findByText('Tag name already exists'),
    ).toBeInTheDocument();
  });

  it('closes on cancel', () => {
    render(<TagDialog open onClose={onClose} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
