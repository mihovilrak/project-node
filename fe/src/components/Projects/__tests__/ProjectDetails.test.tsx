import React from 'react';
import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectDetails from '../ProjectDetails';
import { useProjectDetails } from '../../../hooks/project/useProjectDetails';
import { Project, ProjectMember } from '../../../types/project';
import { Task } from '../../../types/task';
import { TimeLog } from '../../../types/timeLog';

const renderWithRouter = (ui: React.ReactElement) => {
return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// Mock the custom hook
jest.mock('../../../hooks/project/useProjectDetails');
const mockUseProjectDetails = useProjectDetails as jest.Mock;

// Mock data
const mockProject: Project = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  start_date: '2024-01-01',
  due_date: '2024-12-31',
  status_id: 1,
  status_name: 'Active',
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2024-01-01',
  parent_id: null,
  parent_name: null,
  estimated_time: 100,
  spent_time: 50,
  progress: 50
};

const mockMembers: ProjectMember[] = [{
  project_id: 1,
  user_id: 1,
  role_id: 1,
  created_on: '2024-01-01',
  name: 'Test User',
  surname: 'Test',
  role: 'Admin'
}];

const mockTasks: Task[] = [{
  id: 1,
  name: 'Test Task',
  project_id: 1,
  project_name: 'Test Project',
  holder_id: 1,
  holder_name: 'Test User',
  assignee_id: 1,
  assignee_name: 'Test User',
  description: 'Test Description',
  type_id: 1,
  type_name: 'Task',
  status_id: 1,
  status_name: 'Active',
  priority_id: 1,
  priority_name: 'High',
  start_date: '2024-01-01',
  due_date: '2024-12-31',
  end_date: null,
  spent_time: 0,
  progress: 0,
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2024-01-01',
  estimated_time: 10,
  parent_id: null,
  parent_name: null
}];

const mockTimeLogs: TimeLog[] = [{
  id: 1,
  task_id: 1,
  user_id: 1,
  activity_type_id: 1,
  log_date: '2024-01-01',
  spent_time: 8,
  description: 'Test Log',
  created_on: '2024-01-01',
  updated_on: null
}];

const defaultHookReturn = {
  project: mockProject,
  projectDetails: mockProject,
  members: mockMembers,
  tasks: mockTasks,
  timeLogs: mockTimeLogs,
  loading: false,
  error: null,
  editDialogOpen: false,
  deleteDialogOpen: false,
  taskFormOpen: false,
  timeLogDialogOpen: false,
  manageMembersOpen: false,
  selectedTimeLog: null,
  canEdit: true,
  canDelete: true,
  canManageMembers: true,
  isProjectMember: true,
  setState: jest.fn(),
  handleProjectUpdate: jest.fn(),
  handleProjectDelete: jest.fn(),
  handleMemberRemove: jest.fn(),
  handleTaskCreate: jest.fn(),
  handleTimeLogSubmit: jest.fn(),
  handleTimeLogEdit: jest.fn(),
  handleTimeLogDelete: jest.fn(),
  handleMembersUpdate: jest.fn(),
  setTimeLogDialogOpen: jest.fn(),
  setSelectedTimeLog: jest.fn(),
  setTaskFormOpen: jest.fn(),
  setManageMembersOpen: jest.fn(),
  loadTasks: jest.fn(),
  loadMembers: jest.fn(),
  loadTimeLogs: jest.fn(),
  setTasks: jest.fn(),
  setMembers: jest.fn(),
  setTimeLogs: jest.fn()
};

describe('ProjectDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProjectDetails.mockReturnValue(defaultHookReturn);
  });

  it('renders loading state correctly', () => {
    mockUseProjectDetails.mockReturnValue({ ...defaultHookReturn, loading: true });
    renderWithRouter(<ProjectDetails />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    mockUseProjectDetails.mockReturnValue({ 
      ...defaultHookReturn, 
      error: 'Error loading project'
    });
    renderWithRouter(<ProjectDetails />);
    expect(screen.getByText('Error loading project')).toBeInTheDocument();
  });

  it('renders project not found state correctly', () => {
    mockUseProjectDetails.mockReturnValue({ ...defaultHookReturn, project: null });
    renderWithRouter(<ProjectDetails />);
    expect(screen.getByText('Project not found')).toBeInTheDocument();
  });

  it('renders project details correctly', () => {
    renderWithRouter(<ProjectDetails />);
    expect(screen.getByText(mockProject.name)).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Time Log')).toBeInTheDocument();
    expect(screen.getByText('Gantt')).toBeInTheDocument();
  });

  it('handles tab changes correctly', () => {
    renderWithRouter(<ProjectDetails />);
    const tasksTab = screen.getByText('Tasks');
    fireEvent.click(tasksTab);
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('opens edit dialog when edit button is clicked', () => {
    renderWithRouter(<ProjectDetails />);
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(defaultHookReturn.setState).toHaveBeenCalled();
  });

  it('opens delete dialog when delete button is clicked', () => {
    renderWithRouter(<ProjectDetails />);
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(defaultHookReturn.setState).toHaveBeenCalled();
  });

  it('handles project update correctly', async () => {
    renderWithRouter(<ProjectDetails />);
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    // Wait for dialog to open and trigger update
    await waitFor(() => {
      expect(defaultHookReturn.handleProjectUpdate).toHaveBeenCalled();
    });
  });

  it('handles project deletion correctly', async () => {
    renderWithRouter(<ProjectDetails />);
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    // Wait for dialog to open and trigger delete
    await waitFor(() => {
      expect(defaultHookReturn.handleProjectDelete).toHaveBeenCalled();
    });
  });

  it('handles permission restrictions correctly', () => {
    mockUseProjectDetails.mockReturnValue({
      ...defaultHookReturn,
      canEdit: false,
      canDelete: false,
      canManageMembers: false
    });
    
    renderWithRouter(<ProjectDetails />);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});