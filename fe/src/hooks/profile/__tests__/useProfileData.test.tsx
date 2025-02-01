import { renderHook, act } from '@testing-library/react-hooks';
import { useProfileData } from '../useProfileData';
import {
  getProfile,
  getRecentTasks,
  getRecentProjects,
  updateProfile
} from '../../../api/profiles';
import { ProfileData, ProfileUpdateData } from '../../../types/profile';
import { Task } from '../../../types/task';
import { Project } from '../../../types/project';

// Mock the react-router-dom hook
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

// Mock the API calls
jest.mock('../../../api/profiles');

const mockProfileData: ProfileData = {
  id: 1,
  login: 'johndoe',
  name: 'John',
  surname: 'Doe',
  email: 'john@example.com',
  role_id: 1,
  status_id: 1,
  total_tasks: 10,
  completed_tasks: 5,
  active_projects: 3,
  total_hours: 40,
  avatar_url: null,
  created_on: '2024-01-01',
  updated_on: '2024-01-01',
  last_login: '2024-01-01'
};

const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Task 1',
    project_id: 1,
    project_name: 'Project 1',
    holder_id: 1,
    holder_name: 'John Doe',
    assignee_id: 1,
    assignee_name: 'John Doe',
    parent_id: null,
    parent_name: null,
    description: '',
    type_id: 1,
    type_name: 'Feature',
    type_color: '#4CAF50',
    type_icon: 'star',
    status_id: 1,
    status_name: 'in_progress',
    priority_id: 2,
    priority_name: 'medium',
    priority_color: '#FFA726',
    start_date: '2024-01-01',
    due_date: null,
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'John Doe',
    created_on: '2024-01-01',
    estimated_time: null
  },
  {
    id: 2,
    name: 'Task 2',
    project_id: 1,
    project_name: 'Project 1',
    holder_id: 1,
    holder_name: 'John Doe',
    assignee_id: 1,
    assignee_name: 'John Doe',
    parent_id: null,
    parent_name: null,
    description: '',
    type_id: 1,
    type_name: 'Feature',
    type_color: '#4CAF50',
    type_icon: 'star',
    status_id: 2,
    status_name: 'completed',
    priority_id: 2,
    priority_name: 'medium',
    priority_color: '#FFA726',
    start_date: '2024-01-01',
    due_date: null,
    end_date: '2024-01-01',
    spent_time: 8,
    progress: 100,
    created_by: 1,
    created_by_name: 'John Doe',
    created_on: '2024-01-01',
    estimated_time: null
  }
];

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Project 1',
    description: '',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'active',
    start_date: '2024-01-01',
    due_date: '2024-12-31',
    created_by: 1,
    created_by_name: 'John Doe',
    created_on: '2024-01-01',
    estimated_time: 160,
    spent_time: 0,
    progress: 0
  },
  {
    id: 2,
    name: 'Project 2',
    description: '',
    parent_id: null,
    parent_name: null,
    status_id: 2,
    status_name: 'completed',
    start_date: '2024-01-01',
    due_date: '2024-01-31',
    created_by: 1,
    created_by_name: 'John Doe',
    created_on: '2024-01-01',
    estimated_time: 80,
    spent_time: 80,
    progress: 100
  }
];

describe('useProfileData', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (getProfile as jest.Mock).mockResolvedValue(mockProfileData);
    (getRecentTasks as jest.Mock).mockResolvedValue(mockTasks);
    (getRecentProjects as jest.Mock).mockResolvedValue(mockProjects);
    (updateProfile as jest.Mock).mockResolvedValue(mockProfileData);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useProfileData());

    expect(result.current.profile).toBeNull();
    expect(result.current.recentTasks).toEqual([]);
    expect(result.current.recentProjects).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.stats).toEqual({
      totalTasks: 0,
      completedTasks: 0,
      activeProjects: 0,
      totalHours: 0
    });
  });

  it('should fetch profile data on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProfileData());
    
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(getProfile).toHaveBeenCalled();
    expect(getRecentTasks).toHaveBeenCalled();
    expect(getRecentProjects).toHaveBeenCalled();
    
    expect(result.current.profile).toEqual(mockProfileData);
    expect(result.current.recentTasks).toEqual(mockTasks);
    expect(result.current.recentProjects).toEqual(mockProjects);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    (getProfile as jest.Mock).mockRejectedValue(error);
    
    const { result, waitForNextUpdate } = renderHook(() => useProfileData());
    
    await waitForNextUpdate();
    
    expect(result.current.error).toBe('Failed to fetch profile data');
    expect(result.current.loading).toBe(false);
  });

  it('should update profile successfully', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProfileData());
    await waitForNextUpdate();

    const updateData: ProfileUpdateData = {
      name: 'Updated Name',
      surname: 'Doe',
      email: 'updated@example.com'
    };

    await act(async () => {
      await result.current.handleProfileUpdate(updateData);
    });

    expect(updateProfile).toHaveBeenCalledWith(updateData);
    expect(result.current.updateSuccess).toBe(true);
    expect(result.current.editDialogOpen).toBe(false);
  });

  it('should handle dialog state correctly', () => {
    const { result } = renderHook(() => useProfileData());

    act(() => {
      result.current.setEditDialogOpen(true);
    });
    expect(result.current.editDialogOpen).toBe(true);

    act(() => {
      result.current.setEditDialogOpen(false);
    });
    expect(result.current.editDialogOpen).toBe(false);

    act(() => {
      result.current.setPasswordDialogOpen(true);
    });
    expect(result.current.passwordDialogOpen).toBe(true);

    act(() => {
      result.current.setPasswordDialogOpen(false);
    });
    expect(result.current.passwordDialogOpen).toBe(false);
  });

  it('should update stats when profile data changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProfileData());
    
    await waitForNextUpdate();
    
    expect(result.current.stats).toEqual({
      totalTasks: mockProfileData.total_tasks,
      completedTasks: mockProfileData.completed_tasks,
      activeProjects: mockProfileData.active_projects,
      totalHours: mockProfileData.total_hours
    });
  });
});
