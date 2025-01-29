import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityTypesTable from '../ActivityTypesTable';
import { ActivityType } from '../../../types/setting';

const mockActivityTypes: ActivityType[] = [
  {
    id: 1,
    name: "Development",
    description: "Software development tasks",
    color: "#FF0000",
    icon: "code",
    active: true
  },
  {
    id: 2,
    name: "Meeting",
    description: "Team meetings",
    color: "#00FF00",
    icon: undefined,
    active: false
  }
];

const defaultProps = {
  activityTypes: mockActivityTypes,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  loading: false
};

describe('ActivityTypesTable', () => {
  it('shows loading spinner when loading is true', () => {
    render(<ActivityTypesTable {...defaultProps} loading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders all columns in the table header', () => {
    render(<ActivityTypesTable {...defaultProps} />);
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders activity type data correctly', () => {
    render(<ActivityTypesTable {...defaultProps} />);
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Software development tasks')).toBeInTheDocument();
    expect(screen.getByText('Meeting')).toBeInTheDocument();
    expect(screen.getByText('Team meetings')).toBeInTheDocument();
  });

  it('displays icon when provided', () => {
    render(<ActivityTypesTable {...defaultProps} />);
    const icons = screen.getAllByText('code');
    expect(icons).toHaveLength(1);
  });

  it('shows correct status chips', () => {
    render(<ActivityTypesTable {...defaultProps} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<ActivityTypesTable {...defaultProps} />);
    const editButtons = screen.getAllByRole('button');
    fireEvent.click(editButtons[0]);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockActivityTypes[0]);
  });

  it('renders empty table when no activity types', () => {
    render(<ActivityTypesTable {...defaultProps} activityTypes={[]} />);
    expect(screen.queryByText('Development')).not.toBeInTheDocument();
  });

  it('renders color blocks with correct styles', () => {
    const { container } = render(<ActivityTypesTable {...defaultProps} />);
    const colorBlocks = container.querySelectorAll('div[style*="backgroundColor"]');
    expect(colorBlocks[0]).toHaveStyle({ backgroundColor: '#FF0000' });
    expect(colorBlocks[1]).toHaveStyle({ backgroundColor: '#00FF00' });
  });
});