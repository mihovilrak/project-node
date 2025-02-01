import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../TestWrapper';
import Projects from '../../components/Projects/Projects';
import { api } from '../../api/api';
import { Project, ProjectMember } from '../../types/project';
import ProjectForm from '../../components/Projects/ProjectForm';

// Mock the API calls
jest.mock('../../api/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Project Management Flow', () => {
  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'Active',
    start_date: '2025-01-25',
    due_date: '2025-02-25',
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2025-01-25',
    estimated_time: 40,
    spent_time: 0,
    progress: 0
  };

  const mockMember: ProjectMember = {
    project_id: 1,
    user_id: 2,
    created_on: '2025-01-25',
    name: 'John',
    surname: 'Doe',
    role: 'Reporter'
  };

  const mockSubproject: Project = {
    id: 2,
    name: 'Test Subproject',
    description: 'Subproject Description',
    parent_id: 1,
    parent_name: 'Test Project',
    status_id: 1,
    status_name: 'Active',
    start_date: '2025-01-26',
    due_date: '2025-02-15',
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2025-01-25',
    estimated_time: 20,
    spent_time: 0,
    progress: 0
  };

  const mockTimeLog = {
    id: 1,
    project_id: 1,
    task_id: null,
    user_id: 1,
    date: '2025-01-25',
    hours: 4,
    description: 'Test time log',
    created_on: '2025-01-25'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default API responses
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/projects') {
        return Promise.resolve({ data: [mockProject] });
      }
      if (url === 'projects/1/members') {
        return Promise.resolve({ data: [mockMember] });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('should create a new project', async () => {
    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Mock the create project API call
    mockedApi.post.mockResolvedValueOnce({ data: mockProject });

    // Click create project button
    const createButton = screen.getByRole('button', { name: /create project/i });
    await userEvent.click(createButton);

    // Fill in the project form
    const nameInput = screen.getByLabelText(/name/i);
    const descInput = screen.getByLabelText(/description/i);
    await userEvent.type(nameInput, 'Test Project');
    await userEvent.type(descInput, 'Test Description');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // Verify API was called with correct data
    expect(mockedApi.post).toHaveBeenCalledWith('projects', expect.objectContaining({
      name: 'Test Project',
      description: 'Test Description'
    }));

    // Verify project appears in the list
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('should edit an existing project', async () => {
    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Mock the update project API call
    mockedApi.patch.mockResolvedValueOnce({
      data: { ...mockProject, name: 'Updated Project', description: 'Updated Description' }
    });

    // Click edit button on the project
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Update project details
    const nameInput = screen.getByLabelText(/name/i);
    const descInput = screen.getByLabelText(/description/i);
    await userEvent.clear(nameInput);
    await userEvent.clear(descInput);
    await userEvent.type(nameInput, 'Updated Project');
    await userEvent.type(descInput, 'Updated Description');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // Verify API was called with correct data
    expect(mockedApi.patch).toHaveBeenCalledWith('projects/1', expect.objectContaining({
      name: 'Updated Project',
      description: 'Updated Description'
    }));

    // Verify updated project appears in the list
    await waitFor(() => {
      expect(screen.getByText('Updated Project')).toBeInTheDocument();
    });
  });

  it('should delete a project', async () => {
    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Mock the delete project API call
    mockedApi.delete.mockResolvedValueOnce({ data: {} });

    // Click delete button on the project
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // Confirm deletion in the modal
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    // Verify API was called
    expect(mockedApi.delete).toHaveBeenCalledWith('projects/1');

    // Verify project is removed from the list
    await waitFor(() => {
      expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
    });
  });

  it('should manage project members', async () => {
    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Mock add member API call
    mockedApi.post.mockResolvedValueOnce({
      data: { ...mockMember, user_id: 3, name: 'Jane', surname: 'Smith' }
    });

    // Click manage members button
    const membersButton = screen.getByRole('button', { name: /manage members/i });
    await userEvent.click(membersButton);

    // Add a new member
    const addMemberButton = screen.getByRole('button', { name: /add member/i });
    await userEvent.click(addMemberButton);

    // Select a user from the dropdown
    const userSelect = screen.getByRole('combobox');
    await userEvent.selectOptions(userSelect, '3');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // Verify API was called with correct data
    expect(mockedApi.post).toHaveBeenCalledWith('projects/1/members', expect.objectContaining({
      user_id: 3
    }));

    // Verify new member appears in the list
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should filter and search projects', async () => {
    // Mock additional projects for search test
    const mockProjects = [
      mockProject,
      { ...mockProject, id: 2, name: 'Development Project' },
      { ...mockProject, id: 3, name: 'Marketing Campaign' }
    ];

    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/projects') {
        return Promise.resolve({ data: mockProjects });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Wait for all projects to load
    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(4); // Including header row
    });

    // Search for a specific project
    const searchInput = screen.getByRole('textbox', { name: /search/i });
    await userEvent.type(searchInput, 'Development');

    // Verify only matching projects are shown
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2); // Header + 1 matching project
      expect(screen.getByText('Development Project')).toBeInTheDocument();
      expect(screen.queryByText('Marketing Campaign')).not.toBeInTheDocument();
    });

    // Clear search and filter by status
    await userEvent.clear(searchInput);
    const statusFilter = screen.getByRole('combobox', { name: /status/i });
    await userEvent.selectOptions(statusFilter, 'Active');

    // Verify filtered results
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
      rows.slice(1).forEach(row => {
        expect(within(row).getByText('Active')).toBeInTheDocument();
      });
    });
  });

  it('should create a subproject', async () => {
    // Mock the router location
    window.history.pushState({}, '', '/?parentId=1');
    
    render(
      <TestWrapper>
        <ProjectForm />
      </TestWrapper>
    );

    // Mock API responses
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/projects') {
        return Promise.resolve({ data: [mockProject] });
      }
      if (url === '/users') {
        return Promise.resolve({ data: [{ id: 1, name: 'Test User' }] });
      }
      return Promise.resolve({ data: {} });
    });

    mockedApi.post.mockResolvedValueOnce({ data: mockSubproject });

    // Fill in the project details form
    const nameInput = screen.getByLabelText(/name/i);
    const descInput = screen.getByLabelText(/description/i);
    const startDateInput = screen.getByLabelText(/start date/i);
    const dueDateInput = screen.getByLabelText(/due date/i);

    await userEvent.type(nameInput, 'Test Subproject');
    await userEvent.type(descInput, 'Subproject Description');
    await userEvent.type(startDateInput, '2025-01-26');
    await userEvent.type(dueDateInput, '2025-02-15');

    // Submit details form
    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    // Submit members form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // Verify API was called with correct data
    expect(mockedApi.post).toHaveBeenCalledWith('projects', expect.objectContaining({
      name: 'Test Subproject',
      description: 'Subproject Description',
      parent_id: 1,
      start_date: '2025-01-26',
      due_date: '2025-02-15'
    }));
  });

  it('should create and manage subprojects', async () => {
    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Mock the create subproject API call
    mockedApi.post.mockResolvedValueOnce({ data: mockSubproject });

    // Click on parent project to open details
    const projectRow = screen.getByText('Test Project').closest('tr');
    await userEvent.click(projectRow!);

    // Click create subproject button
    const createSubprojectButton = screen.getByRole('button', { name: /create subproject/i });
    await userEvent.click(createSubprojectButton);

    // Fill in the subproject form
    const nameInput = screen.getByLabelText(/name/i);
    const descInput = screen.getByLabelText(/description/i);
    const startDateInput = screen.getByLabelText(/start date/i);
    const dueDateInput = screen.getByLabelText(/due date/i);

    await userEvent.type(nameInput, 'Test Subproject');
    await userEvent.type(descInput, 'Subproject Description');
    await userEvent.type(startDateInput, '2025-01-26');
    await userEvent.type(dueDateInput, '2025-02-15');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // Verify API was called with correct data
    expect(mockedApi.post).toHaveBeenCalledWith('projects', expect.objectContaining({
      name: 'Test Subproject',
      description: 'Subproject Description',
      parent_id: 1
    }));

    // Verify subproject appears in the list
    await waitFor(() => {
      expect(screen.getByText('Test Subproject')).toBeInTheDocument();
    });
  });

  it('should log time on project level', async () => {
    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Wait for projects to load and navigate to project details
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Click on project to open details
    const projectRow = screen.getByText('Test Project').closest('tr');
    await userEvent.click(projectRow!);

    // Navigate to Time Logs tab
    const timeLogsTab = screen.getByRole('tab', { name: /time logs/i });
    await userEvent.click(timeLogsTab);

    // Mock the create time log API call
    mockedApi.post.mockResolvedValueOnce({ data: mockTimeLog });

    // Click create time log button
    const createTimeLogButton = screen.getByRole('button', { name: /create time log/i });
    await userEvent.click(createTimeLogButton);

    // Fill in the time log form
    const hoursInput = screen.getByLabelText(/hours/i);
    const descInput = screen.getByLabelText(/description/i);
    const dateInput = screen.getByLabelText(/date/i);

    await userEvent.type(hoursInput, '4');
    await userEvent.type(descInput, 'Test time log');
    await userEvent.type(dateInput, '2025-01-25');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // Verify time log appears in the list
    await waitFor(() => {
      expect(screen.getByText('4h')).toBeInTheDocument();
      expect(screen.getByText('Test time log')).toBeInTheDocument();
    });
  });

  it('should display and interact with project Gantt chart', async () => {
    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Wait for projects to load and navigate to project details
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Click on project to open details
    const projectRow = screen.getByText('Test Project').closest('tr');
    await userEvent.click(projectRow!);

    // Navigate to Gantt tab
    const ganttTab = screen.getByRole('tab', { name: /gantt/i });
    await userEvent.click(ganttTab);

    // Mock the tasks for Gantt
    const mockTasks = [
      {
        id: 1,
        title: 'Test Project',
        startDate: new Date('2025-01-25'),
        endDate: new Date('2025-02-25'),
        assigneeId: 1
      },
      {
        id: 2,
        title: 'Test Task',
        startDate: new Date('2025-01-26'),
        endDate: new Date('2025-02-15'),
        assigneeId: 1
      }
    ];

    // Verify Scheduler component is rendered
    const scheduler = screen.getByRole('grid');
    expect(scheduler).toBeInTheDocument();

    // Verify view switching
    const viewSwitcher = screen.getByRole('button', { name: /view switcher/i });
    await userEvent.click(viewSwitcher);
    
    const monthView = screen.getByRole('option', { name: /month/i });
    await userEvent.click(monthView);

    // Verify navigation
    const nextButton = screen.getByRole('button', { name: /next/i });
    const prevButton = screen.getByRole('button', { name: /previous/i });
    
    await userEvent.click(nextButton);
    await userEvent.click(prevButton);

    // Verify today button
    const todayButton = screen.getByRole('button', { name: /today/i });
    await userEvent.click(todayButton);
  });
});
