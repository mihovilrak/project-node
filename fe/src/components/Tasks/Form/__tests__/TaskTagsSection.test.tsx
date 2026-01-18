import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskTagsSection } from '../TaskTagsSection';
import TagSelect from '../../TagSelect';
import { Tag } from '../../../../types/tag';

// Mock the TagSelect component
jest.mock('../../TagSelect', () => {
  return jest.fn((props) => {
    return <div data-testid="mock-tag-select">TagSelect Component</div>;
  });
});

describe('TaskTagsSection', () => {
  const mockTag: Tag = {
    id: 1,
    name: 'Frontend',
    color: '#e91e63',
    description: null,
    created_by: 1,
    active: true,
    created_on: '2023-01-01',
    creator_name: 'Test User'
  };

  const defaultProps = {
    formData: {
      name: '',
      description: '',
      project_id: null,
      type_id: null,
      priority_id: null,
      status_id: null,
      parent_id: null,
      holder_id: null,
      assignee_id: null,
      start_date: null,
      due_date: null,
      estimated_time: null,
      tags: [mockTag]
    },
    handleChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TaskTagsSection {...defaultProps} />);
    expect(screen.getByTestId('mock-tag-select')).toBeInTheDocument();
  });

  it('passes correct props to TagSelect', () => {
    render(<TaskTagsSection {...defaultProps} />);
    // Check the first argument of the first call to TagSelect
    const call = (TagSelect as jest.Mock).mock.calls[0][0];
    expect(call.selectedTags).toEqual(defaultProps.formData.tags);
    expect(typeof call.onTagsChange).toBe('function');
  });

  it('handles empty tags properly', () => {
    const propsWithoutTags = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        tags: []
      }
    };
    render(<TaskTagsSection {...propsWithoutTags} />);
    const call = (TagSelect as jest.Mock).mock.calls[0][0];
    expect(call.selectedTags).toEqual([]);
  });

  it('calls handleChange when tags are updated', () => {
    render(<TaskTagsSection {...defaultProps} />);
    const tagSelectProps = (TagSelect as jest.Mock).mock.calls[0][0];
    const newTags = [{ ...mockTag, id: 2 }];

    tagSelectProps.onTagsChange(newTags);

    expect(defaultProps.handleChange).toHaveBeenCalledWith({
      target: {
        name: 'tags',
        value: newTags
      }
    });
  });

  it('has proper material-ui Box styling', () => {
    const { container } = render(<TaskTagsSection {...defaultProps} />);
    const boxElement = container.firstChild;
    expect(boxElement).toHaveStyle({ marginBottom: '16px' }); // mb: 2 converts to 16px
  });
});