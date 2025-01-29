import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TagSelect from '../TagSelect';
import { getTags } from '../../../api/tags';
import { Tag } from '../../../types/tag';

// Mock the API calls
jest.mock('../../../api/tags');
const mockedGetTags = getTags as jest.MockedFunction<typeof getTags>;

const mockTags: Tag[] = [
  {
    id: 1,
    name: 'Bug',
    color: '#ff0000',
    description: 'Bug description',
    created_by: 1,
    active: true,
    created_on: '2023-01-01',
    creator_name: 'John Doe'
  },
  {
    id: 2,
    name: 'Feature',
    color: '#00ff00',
    description: 'Feature description',
    created_by: 1,
    active: true,
    created_on: '2023-01-01',
    creator_name: 'John Doe'
  },
  {
    id: 3,
    name: 'Inactive',
    color: '#0000ff',
    description: 'Inactive tag',
    created_by: 1,
    active: false,
    created_on: '2023-01-01',
    creator_name: 'John Doe'
  }
];

describe('TagSelect Component', () => {
  const onTagsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially', () => {
    render(<TagSelect selectedTags={[]} onTagsChange={onTagsChange} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders tags after loading', async () => {
    mockedGetTags.mockResolvedValue(mockTags);

    render(<TagSelect selectedTags={[]} onTagsChange={onTagsChange} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Open the autocomplete dropdown
    const input = screen.getByRole('combobox');
    fireEvent.click(input);

    // Check if active tags are rendered
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Feature')).toBeInTheDocument();
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
  });

  test('handles tag selection', async () => {
    mockedGetTags.mockResolvedValue(mockTags);

    render(<TagSelect selectedTags={[]} onTagsChange={onTagsChange} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Open the autocomplete dropdown
    const input = screen.getByRole('combobox');
    fireEvent.click(input);

    // Select a tag
    fireEvent.click(screen.getByText('Bug'));

    expect(onTagsChange).toHaveBeenCalledWith([mockTags[0]]);
  });

  test('renders selected tags as chips with correct colors', async () => {
    mockedGetTags.mockResolvedValue(mockTags);

    render(
      <TagSelect
        selectedTags={[mockTags[0]]}
        onTagsChange={onTagsChange}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const chip = screen.getByText('Bug').closest('.MuiChip-root');
    expect(chip).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  test('handles API error', async () => {
    console.error = jest.fn();
    mockedGetTags.mockRejectedValue(new Error('Failed to fetch tags'));

    render(<TagSelect selectedTags={[]} onTagsChange={onTagsChange} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(console.error).toHaveBeenCalledWith(
      'Failed to fetch tags:',
      expect.any(Error)
    );
  });

  test('handles tag removal', async () => {
    mockedGetTags.mockResolvedValue(mockTags);

    render(
      <TagSelect
        selectedTags={[mockTags[0]]}
        onTagsChange={onTagsChange}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Find and click the delete icon on the chip
    const deleteButton = screen.getByTestId('CancelIcon');
    fireEvent.click(deleteButton);

    expect(onTagsChange).toHaveBeenCalledWith([]);
  });
});