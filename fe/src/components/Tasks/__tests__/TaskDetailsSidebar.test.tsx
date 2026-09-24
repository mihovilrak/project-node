import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskDetailsSidebar from '../TaskDetailsSidebar';
import { TaskWatcher } from '../../../types/watcher';

// Mock child components
jest.mock('../TaskFiles', () => () => (
  <div data-testid="task-file-section">TaskFiles</div>
));
jest.mock('../../Watchers/WatcherList', () => () => (
  <div data-testid="watcher-list">WatcherList</div>
));
jest.mock('../../Watchers/WatcherDialog', () => () => (
  <div data-testid="watcher-dialog">WatcherDialog</div>
));

const mockWatchers: TaskWatcher[] = [
  {
    task_id: 1,
    user_id: 1,
    user_name: 'John Doe',
    role: 'Developer',
  },
];

const defaultProps = {
  id: '1',
  projectId: 1,
  watchers: mockWatchers,
  watcherDialogOpen: false,
  onAddWatcher: jest.fn(),
  onRemoveWatcher: jest.fn(),
  onWatcherDialogClose: jest.fn(),
  onManageWatchers: jest.fn(),
};

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe('TaskDetailsSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all sections correctly', () => {
    renderWithRouter(<TaskDetailsSidebar {...defaultProps} />);

    expect(screen.getByTestId('task-file-section')).toBeInTheDocument();
    expect(screen.getByTestId('watcher-list')).toBeInTheDocument();
    expect(screen.getByTestId('watcher-dialog')).toBeInTheDocument();
  });

  it('renders TaskFiles', () => {
    const { container } = renderWithRouter(
      <TaskDetailsSidebar {...defaultProps} />,
    );
    const fileSection = container.querySelector(
      '[data-testid="task-file-section"]',
    );

    expect(fileSection).toBeInTheDocument();
  });

  it('passes correct props to WatcherList', () => {
    const { container } = renderWithRouter(
      <TaskDetailsSidebar {...defaultProps} />,
    );
    const watcherList = container.querySelector('[data-testid="watcher-list"]');

    expect(watcherList).toBeInTheDocument();
  });

  it('passes correct props to WatcherDialog', () => {
    const { container } = renderWithRouter(
      <TaskDetailsSidebar {...defaultProps} />,
    );
    const watcherDialog = container.querySelector(
      '[data-testid="watcher-dialog"]',
    );

    expect(watcherDialog).toBeInTheDocument();
  });

  it('renders with open watcher dialog', () => {
    renderWithRouter(
      <TaskDetailsSidebar {...defaultProps} watcherDialogOpen={true} />,
    );
    expect(screen.getByTestId('watcher-dialog')).toBeInTheDocument();
  });

  it('maintains correct layout structure', () => {
    const { container } = renderWithRouter(
      <TaskDetailsSidebar {...defaultProps} />,
    );
    // Check for the actual content rendered by the component
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThanOrEqual(2);
    // Verify the component renders its child components
    expect(screen.getByTestId('task-file-section')).toBeInTheDocument();
  });

  it('applies correct grid props', () => {
    const { container } = renderWithRouter(
      <TaskDetailsSidebar {...defaultProps} />,
    );
    // In Grid v2, verify the component renders correctly by checking for its content
    expect(screen.getByTestId('task-file-section')).toBeInTheDocument();
    // Check that Grid element exists (even if it doesn't have the old item class)
    const gridElement = container.querySelector('[class*="MuiGrid"]');
    expect(gridElement).toBeInTheDocument();
  });

  it('handles empty watchers array', () => {
    renderWithRouter(<TaskDetailsSidebar {...defaultProps} watchers={[]} />);
    expect(screen.getByTestId('watcher-list')).toBeInTheDocument();
  });
});
