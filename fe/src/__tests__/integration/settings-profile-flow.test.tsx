import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../TestWrapper';
import { api } from '../../api/api';
import { AppSettings, TaskType, ActivityType } from '../../types/setting';
import { Role } from '../../types/role';
import Settings from '../../components/Settings/Settings';

// Mock the API calls
jest.mock('../../api/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Settings and Profile Flow', () => {
  const mockAppSettings: AppSettings = {
    id: 1,
    app_name: 'Project Manager',
    company_name: 'Test Company',
    sender_email: 'noreply@test.com',
    time_zone: 'UTC',
    theme: 'light',
    welcome_message: 'Welcome to Project Manager',
    created_on: '2025-01-26'
  };

  const mockTaskType: TaskType = {
    id: 1,
    name: 'Bug',
    color: '#ff0000',
    icon: 'bug',
    description: 'Software bug that needs fixing',
    active: true
  };

  const mockActivityType: ActivityType = {
    id: 1,
    name: 'Development',
    color: '#00ff00',
    icon: 'code',
    description: 'Software development work',
    active: true
  };

  const mockRole: Role = {
    id: 1,
    name: 'Developer',
    permissions: [ 5, 6, 7, 8, 9, 10],
    created_on: '2025-01-26',
    updated_on: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock initial data loading
    mockedApi.get.mockImplementation((url) => {
      switch (url) {
        case '/settings/app_settings':
          return Promise.resolve({ data: mockAppSettings });
        case '/task-types':
          return Promise.resolve({ data: [mockTaskType] });
        case '/activity-types':
          return Promise.resolve({ data: [mockActivityType] });
        case '/roles':
          return Promise.resolve({ data: [mockRole] });
        default:
          return Promise.reject(new Error('Not found'));
      }
    });
  });

  it('should create a new task type', async () => {
    const newTaskType: TaskType = {
      id: 2,
      name: 'Feature',
      color: '#0000ff',
      icon: 'star',
      description: 'New feature implementation',
      active: true
    };

    mockedApi.post.mockResolvedValueOnce({ data: newTaskType });
    mockedApi.get.mockResolvedValueOnce({ data: [mockTaskType, newTaskType] });

    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Navigate to Task Types tab
    const taskTypesTab = screen.getByRole('tab', { name: /task types/i });
    await userEvent.click(taskTypesTab);

    // Click add button
    const addButton = screen.getByRole('button', { name: /add task type/i });
    await userEvent.click(addButton);

    // Fill form
    const nameInput = screen.getByLabelText(/name/i);
    const colorInput = screen.getByLabelText(/color/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await userEvent.type(nameInput, 'Feature');
    await userEvent.type(colorInput, '#0000ff');
    await userEvent.type(descriptionInput, 'New feature implementation');

    // Save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(mockedApi.post).toHaveBeenCalledWith('/task-types', expect.objectContaining({
      name: 'Feature',
      color: '#0000ff',
      description: 'New feature implementation'
    }));
  });

  it('should update app settings', async () => {
    const updatedAppSettings = {
      ...mockAppSettings,
      welcome_message: 'Welcome to our updated PM tool!',
      theme: 'dark' as const
    };

    mockedApi.put.mockResolvedValueOnce({});

    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Navigate to App Settings tab
    const appSettingsTab = screen.getByRole('tab', { name: /app settings/i });
    await userEvent.click(appSettingsTab);

    // Update welcome message and theme
    const welcomeInput = screen.getByLabelText(/welcome message/i);
    const themeSelect = screen.getByLabelText(/theme/i);

    await userEvent.clear(welcomeInput);
    await userEvent.type(welcomeInput, 'Welcome to our updated PM tool!');
    await userEvent.selectOptions(themeSelect, 'dark');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(mockedApi.put).toHaveBeenCalledWith('/settings/app_settings', expect.objectContaining({
      welcome_message: 'Welcome to our updated PM tool!',
      theme: 'dark'
    }));
  });

  it('should delete a task type', async () => {
    mockedApi.delete.mockResolvedValueOnce({});
    mockedApi.get.mockResolvedValueOnce({ data: [] }); // Empty list after deletion

    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Navigate to Task Types tab
    const taskTypesTab = screen.getByRole('tab', { name: /task types/i });
    await userEvent.click(taskTypesTab);

    // Find and click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    expect(mockedApi.delete).toHaveBeenCalledWith(`/task-types/${mockTaskType.id}`);
  });

  it('should update an existing role', async () => {
    const updatedRole = {
      ...mockRole,
      permissions: [5, 6, 7, 8, 9, 10, 1] // Adding Admin (1) to existing Developer permissions
    };

    mockedApi.put.mockResolvedValueOnce({ data: updatedRole });

    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Navigate to Roles tab
    const rolesTab = screen.getByRole('tab', { name: /roles/i });
    await userEvent.click(rolesTab);

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Add admin permission
    const adminPermissionCheckbox = screen.getByRole('checkbox', { name: /admin/i });
    await userEvent.click(adminPermissionCheckbox);

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(mockedApi.put).toHaveBeenCalledWith(`/roles/${mockRole.id}`, expect.objectContaining({
      permissions: [5, 6, 7, 8, 9, 10, 1]
    }));
  });

  it('should create a new activity type', async () => {
    const newActivityType: ActivityType = {
      id: 2,
      name: 'Analysis',
      color: '#00bcd4',
      icon: 'analytics',
      description: 'System and requirement analysis',
      active: true
    };

    mockedApi.post.mockResolvedValueOnce({ data: newActivityType });
    mockedApi.get.mockResolvedValueOnce({ data: [mockActivityType, newActivityType] });

    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Navigate to Activity Types tab
    const activityTypesTab = screen.getByRole('tab', { name: /activity types/i });
    await userEvent.click(activityTypesTab);

    // Click add button
    const addButton = screen.getByRole('button', { name: /add activity type/i });
    await userEvent.click(addButton);

    // Fill form
    const nameInput = screen.getByLabelText(/name/i);
    const colorInput = screen.getByLabelText(/color/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await userEvent.type(nameInput, 'Analysis');
    await userEvent.type(colorInput, '#00bcd4');
    await userEvent.type(descriptionInput, 'System and requirement analysis');

    // Save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(mockedApi.post).toHaveBeenCalledWith('/activity-types', expect.objectContaining({
      name: 'Analysis',
      color: '#00bcd4',
      description: 'System and requirement analysis'
    }));
  });

  it('should update an existing activity type', async () => {
    const updatedActivityType: ActivityType = {
      ...mockActivityType,
      color: '#1976d2',
      description: 'Updated development work description'
    };

    mockedApi.put.mockResolvedValueOnce({ data: updatedActivityType });

    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Navigate to Activity Types tab
    const activityTypesTab = screen.getByRole('tab', { name: /activity types/i });
    await userEvent.click(activityTypesTab);

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Update color and description
    const colorInput = screen.getByLabelText(/color/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await userEvent.clear(colorInput);
    await userEvent.type(colorInput, '#1976d2');
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'Updated development work description');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(mockedApi.put).toHaveBeenCalledWith(`/activity-types/${mockActivityType.id}`, expect.objectContaining({
      color: '#1976d2',
      description: 'Updated development work description'
    }));
  });

  it('should delete an activity type', async () => {
    mockedApi.delete.mockResolvedValueOnce({});
    mockedApi.get.mockResolvedValueOnce({ data: [] }); // Empty list after deletion

    render(
      <TestWrapper>
        <Settings />
      </TestWrapper>
    );

    // Navigate to Activity Types tab
    const activityTypesTab = screen.getByRole('tab', { name: /activity types/i });
    await userEvent.click(activityTypesTab);

    // Find and click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    expect(mockedApi.delete).toHaveBeenCalledWith(`/activity-types/${mockActivityType.id}`);
  });
});
