import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WatcherList from '../WatcherList';
import { TaskWatcher } from '../../../types/watcher';

const MockPermissionButton = ({ children, onClick }: any) => {
  return <button onClick={onClick}>{children}</button>;
};

// Mock PermissionButton component
jest.mock('../../common/PermissionButton', () => {
  return MockPermissionButton; 
});

const mockWatchers: TaskWatcher[] = [
  { task_id: 1, user_id: 1, user_name: 'John Doe', role: 'Developer' },
  { task_id: 1, user_id: 2, user_name: 'Jane Smith', role: 'Project Manager' },
];

const defaultProps = {
  watchers: mockWatchers,
  canManageWatchers: true,
  onRemoveWatcher: jest.fn(),
  onManageWatchers: jest.fn(),
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('WatcherList', () => {
  it('renders watchers list correctly', () => {
    renderWithRouter(<WatcherList {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows empty state when no watchers', () => {
    renderWithRouter(<WatcherList {...defaultProps} watchers={[]} />);
    expect(screen.getByText('No watchers')).toBeInTheDocument();
  });

  it('calls onRemoveWatcher when delete button is clicked', () => {
    renderWithRouter(<WatcherList {...defaultProps} />);
    const deleteButtons = screen.getAllByRole('button', { name: /remove watcher/i });
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onRemoveWatcher).toHaveBeenCalledWith(mockWatchers[0].user_id);
  });

  it('calls onManageWatchers when manage button is clicked', () => {
    renderWithRouter(<WatcherList {...defaultProps} />);
    const manageButton = screen.getByText(/manage watchers/i);
    fireEvent.click(manageButton);
    expect(defaultProps.onManageWatchers).toHaveBeenCalled();
  });

  it('hides manage buttons when canManageWatchers is false', () => {
    renderWithRouter(<WatcherList {...defaultProps} canManageWatchers={false} />);
    expect(screen.queryByText(/manage watchers/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove watcher/i })).not.toBeInTheDocument();
  });

  it('renders user links correctly', () => {
    renderWithRouter(<WatcherList {...defaultProps} />);
    const userLinks = screen.getAllByRole('link');
    expect(userLinks).toHaveLength(mockWatchers.length);
    expect(userLinks[0]).toHaveAttribute('href', `/users/${mockWatchers[0].user_id}`);
  });
});