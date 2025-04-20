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
    // Always return mockTags unless overridden in a test
    mockedGetTags.mockResolvedValue(mockTags);
  });

  test('shows loading state initially', () => {
    render(<TagSelect selectedTags={[]} onTagsChange={onTagsChange} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders tags after loading', async () => {
    render(<TagSelect selectedTags={[]} onTagsChange={onTagsChange} />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    // Open the dropdown
    fireEvent.mouseDown(screen.getByRole('combobox'));

    // Wait for the options to appear
    const options = await screen.findAllByRole('option');
    const optionTexts = options.map(opt => opt.textContent);

    expect(optionTexts).toEqual(
      expect.arrayContaining(['Bug', 'Feature'])
    );
    expect(optionTexts).not.toContain('Inactive');
  });

  test('handles tag selection', async () => {
    render(<TagSelect selectedTags={[]} onTagsChange={onTagsChange} />);

    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    // Open the dropdown
    fireEvent.mouseDown(screen.getByRole('combobox'));

    // Use a robust query for the option (Material-UI splits text)
    const bugOption = screen.getAllByRole('option').find(opt => /bug/i.test(opt.textContent || ''));
    expect(bugOption).toBeDefined();
    fireEvent.click(bugOption!);

    // The onTagsChange callback should be called with the selected tag
    await waitFor(() => {
      expect(onTagsChange).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'Bug' })
      ]);
    });
  });

  test('renders selected tags as chips with correct colors', async () => {
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