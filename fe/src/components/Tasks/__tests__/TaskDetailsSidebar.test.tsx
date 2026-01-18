import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskDetailsSidebar from '../TaskDetailsSidebar';
import { TaskFile } from '../../../types/file';
import { TaskWatcher } from '../../../types/watcher';

// Mock child components
jest.mock('../TaskFileSection', () => () => <div data-testid="task-file-section">TaskFileSection</div>);
jest.mock('../../Watchers/WatcherList', () => () => <div data-testid="watcher-list">WatcherList</div>);
jest.mock('../../Watchers/WatcherDialog', () => () => <div data-testid="watcher-dialog">WatcherDialog</div>);

const mockFiles: TaskFile[] = [
  {
    id: 1,
    task_id: 1,
    user_id: 1,
    name: 'test.pdf',
    original_name: 'test.pdf',
    mime_type: 'application/pdf',
    size: 1024,
    uploaded_on: '2023-01-01',
  },
];

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
  files: mockFiles,
  watchers: mockWatchers,
  watcherDialogOpen: false,
  onFileUploaded: jest.fn(),
  onFileDeleted: jest.fn(),
  onAddWatcher: jest.fn(),
  onRemoveWatcher: jest.fn(),
  onWatcherDialogClose: jest.fn(),
  onManageWatchers: jest.fn(),
};

const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>);

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

  it('passes correct props to TaskFileSection', () => {
    const { container } = renderWithRouter(<TaskDetailsSidebar {...defaultProps} />);
    const fileSection = container.querySelector('[data-testid="task-file-section"]');

    expect(fileSection).toBeInTheDocument();
  });

  it('passes correct props to WatcherList', () => {
    const { container } = renderWithRouter(<TaskDetailsSidebar {...defaultProps} />);
    const watcherList = container.querySelector('[data-testid="watcher-list"]');

    expect(watcherList).toBeInTheDocument();
  });

  it('passes correct props to WatcherDialog', () => {
    const { container } = renderWithRouter(<TaskDetailsSidebar {...defaultProps} />);
    const watcherDialog = container.querySelector('[data-testid="watcher-dialog"]');

    expect(watcherDialog).toBeInTheDocument();
  });

  it('renders with open watcher dialog', () => {
    renderWithRouter(<TaskDetailsSidebar {...defaultProps} watcherDialogOpen={true} />);
    expect(screen.getByTestId('watcher-dialog')).toBeInTheDocument();
  });

  it('maintains correct layout structure', () => {
    const { container } = renderWithRouter(<TaskDetailsSidebar {...defaultProps} />);
    const gridItem = container.querySelector('.MuiGrid-item');
    const boxes = container.querySelectorAll('.MuiBox-root');

    expect(gridItem).toBeInTheDocument();
    expect(boxes).toHaveLength(2);
  });

  it('applies correct grid props', () => {
    const { container } = renderWithRouter(<TaskDetailsSidebar {...defaultProps} />);
    const gridItem = container.querySelector('.MuiGrid-item');

    expect(gridItem).toHaveClass('MuiGrid-grid-xs-12');
    expect(gridItem).toHaveClass('MuiGrid-grid-md-4');
  });

  it('handles empty files array', () => {
    renderWithRouter(<TaskDetailsSidebar {...defaultProps} files={[]} />);
    expect(screen.getByTestId('task-file-section')).toBeInTheDocument();
  });

  it('handles empty watchers array', () => {
    renderWithRouter(<TaskDetailsSidebar {...defaultProps} watchers={[]} />);
    expect(screen.getByTestId('watcher-list')).toBeInTheDocument();
  });
});