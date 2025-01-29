import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectTabPanels from '../ProjectTabPanels';

// Mock child components
jest.mock('../tabs/ProjectOverview', () => () => <div data-testid="project-overview">Overview</div>);
jest.mock('../tabs/ProjectTaskList', () => () => <div data-testid="project-task-list">Tasks</div>);
jest.mock('../ProjectGantt', () => () => <div data-testid="project-gantt">Gantt</div>);
jest.mock('../tabs/ProjectMembersList', () => () => <div data-testid="project-members-list">Members</div>);
jest.mock('../../TimeLog/TimeLogList', () => () => <div data-testid="time-log-list">Time Logs</div>);

const mockProject = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  parent_id: null,
  parent_name: null,
  status_id: 1,
  status_name: 'Active',
  start_date: '2023-01-01',
  due_date: '2023-12-31',
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2023-01-01',
  estimated_time: 100,
  spent_time: 50,
  progress: 50
};

const mockProps = {
  activeTab: 0,
  project: mockProject,
  projectDetails: mockProject,
  tasks: [],
  members: [],
  timeLogs: [],
  canManageMembers: true,
  projectId: '1',
  onCreateTask: jest.fn(),
  onManageMembers: jest.fn(),
  onTimeLogCreate: jest.fn(),
  onTimeLogEdit: jest.fn(),
  onTimeLogDelete: jest.fn(),
  onMemberRemove: jest.fn()
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ProjectTabPanels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders overview tab by default', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} />);
    expect(screen.getByTestId('project-overview')).toBeInTheDocument();
  });

  it('renders tasks tab when activeTab is 1', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} activeTab={1} />);
    expect(screen.getByTestId('project-task-list')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('renders members tab when activeTab is 2', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} activeTab={2} />);
    expect(screen.getByTestId('project-members-list')).toBeInTheDocument();
    expect(screen.getByText('Manage Members')).toBeInTheDocument();
  });

  it('renders time logs tab when activeTab is 3', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} activeTab={3} />);
    expect(screen.getByTestId('time-log-list')).toBeInTheDocument();
    expect(screen.getByText('Time Logs')).toBeInTheDocument();
    expect(screen.getByText('Log Time')).toBeInTheDocument();
  });

  it('renders gantt tab when activeTab is 4', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} activeTab={4} />);
    expect(screen.getByTestId('project-gantt')).toBeInTheDocument();
  });

  it('calls onCreateTask when create task button is clicked', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} activeTab={1} />);
    fireEvent.click(screen.getByText('Create Task'));
    expect(mockProps.onCreateTask).toHaveBeenCalled();
  });

  it('calls onManageMembers when manage members button is clicked', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} activeTab={2} />);
    fireEvent.click(screen.getByText('Manage Members'));
    expect(mockProps.onManageMembers).toHaveBeenCalled();
  });

  it('calls onTimeLogCreate when log time button is clicked', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} activeTab={3} />);
    fireEvent.click(screen.getByText('Log Time'));
    expect(mockProps.onTimeLogCreate).toHaveBeenCalledWith(0);
  });

  it('hides tabs content when activeTab does not match', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} activeTab={0} />);
    expect(screen.getByTestId('project-overview')).toBeVisible();
    expect(screen.queryByTestId('project-task-list')).not.toBeVisible();
    expect(screen.queryByTestId('project-members-list')).not.toBeVisible();
    expect(screen.queryByTestId('time-log-list')).not.toBeVisible();
    expect(screen.queryByTestId('project-gantt')).not.toBeVisible();
  });

  it('passes correct props to ProjectMembersList', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} activeTab={2} />);
    const membersList = screen.getByTestId('project-members-list');
    expect(membersList).toBeInTheDocument();
  });

  it('passes correct props to TimeLogList', () => {
    renderWithRouter(<ProjectTabPanels {...mockProps} activeTab={3} />);
    const timeLogList = screen.getByTestId('time-log-list');
    expect(timeLogList).toBeInTheDocument();
  });
});