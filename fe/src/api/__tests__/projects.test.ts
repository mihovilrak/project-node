import { api } from '../api';
import { Project, ProjectMember, ProjectStatus } from '../../types/project';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  getProjectStatuses,
  getProjectDetails,
  addProjectMember,
  removeProjectMember,
  getSubprojects,
  changeProjectStatus,
} from '../projects';

// Mock the api module
jest.mock('../api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Projects API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock data
  const mockProject: Project = {
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
    created_by_name: 'Test Creator',
    created_on: '2023-01-01T00:00:00Z',
    estimated_time: 100,
    spent_time: 40,
    progress: 40,
  };

  const mockProjectMember: ProjectMember = {
    project_id: 1,
    user_id: 1,
    created_on: '2023-01-01T00:00:00Z',
    name: 'Test',
    surname: 'User',
    role: 'Developer',
  };

  const mockProjectStatus: ProjectStatus = {
    id: 1,
    name: 'Active',
  };

  describe('getProjects', () => {
    it('should fetch projects', async () => {
      const mockProjects = [mockProject];
      mockedApi.get.mockResolvedValueOnce({ data: mockProjects });

      const result = await getProjects();

      expect(mockedApi.get).toHaveBeenCalledWith('/projects', {
        params: { limit: 500, offset: 0 },
        signal: undefined,
      });
      expect(result).toEqual(mockProjects);
    });

    it('should request following pages until one comes back short', async () => {
      const fullPage = Array.from({ length: 500 }, (_, i) => ({
        ...mockProject,
        id: i + 1,
      }));
      mockedApi.get
        .mockResolvedValueOnce({ data: fullPage })
        .mockResolvedValueOnce({ data: [mockProject] });

      const result = await getProjects({ status_id: 1 });

      expect(mockedApi.get).toHaveBeenCalledTimes(2);
      expect(mockedApi.get).toHaveBeenLastCalledWith('/projects', {
        params: { status_id: 1, limit: 500, offset: 500 },
        signal: undefined,
      });
      expect(result).toHaveLength(501);
    });
  });

  describe('getProjectDetails', () => {
    it('should fetch project details with members', async () => {
      const projectWithMembers = {
        ...mockProject,
        members: [mockProjectMember],
      };
      mockedApi.get.mockResolvedValueOnce({ data: projectWithMembers });

      const result = await getProjectDetails(1);

      expect(mockedApi.get).toHaveBeenCalledWith('/projects/1/details', {
        signal: undefined,
      });
      expect(result).toEqual(projectWithMembers);
    });

    it('should handle project not found', async () => {
      const notFoundError = new Error('Project not found');
      notFoundError.name = 'NotFoundError';
      mockedApi.get.mockRejectedValueOnce(notFoundError);

      await expect(getProjectDetails(999)).rejects.toThrow('Project not found');
    });
  });

  describe('createProject', () => {
    const newProject = { name: 'New Project', description: 'New Description' };

    it('should create project successfully', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: mockProject });

      const result = await createProject(newProject);

      expect(mockedApi.post).toHaveBeenCalledWith('/projects', newProject);
      expect(result).toEqual(mockProject);
    });

    it('should throw error when creation fails', async () => {
      const error = new Error('Creation failed');
      mockedApi.post.mockRejectedValueOnce(error);

      await expect(createProject(newProject)).rejects.toThrow(error);
    });
  });

  describe('updateProject', () => {
    it('should update project with partial data', async () => {
      const partialUpdate: Partial<Project> = { name: 'Updated Name' };
      mockedApi.put.mockResolvedValueOnce({ data: 1 });

      await expect(updateProject(1, partialUpdate)).resolves.toBeUndefined();

      expect(mockedApi.put).toHaveBeenCalledWith('/projects/1', partialUpdate);
    });

    it('should validate required fields', async () => {
      const invalidUpdate: Partial<Project> = { name: 'test' };
      const validationError = new Error('Validation failed');
      mockedApi.put.mockRejectedValueOnce(validationError);

      await expect(updateProject(1, invalidUpdate)).rejects.toThrow(
        'Validation failed',
      );
    });
  });

  describe('changeProjectStatus', () => {
    it('should patch the status endpoint', async () => {
      mockedApi.patch.mockResolvedValueOnce({ data: {} });

      await changeProjectStatus(1, 3);

      expect(mockedApi.patch).toHaveBeenCalledWith('/projects/1/status', {
        status_id: 3,
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      mockedApi.delete.mockResolvedValueOnce({ data: null });

      await deleteProject(1);

      expect(mockedApi.delete).toHaveBeenCalledWith('/projects/1');
    });

    it('should throw error when deletion fails', async () => {
      const error = new Error('Deletion failed');
      mockedApi.delete.mockRejectedValueOnce(error);

      await expect(deleteProject(1)).rejects.toThrow(error);
    });
  });

  describe('getProjectMembers', () => {
    it('should fetch members successfully', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [mockProjectMember] });
      const result = await getProjectMembers(1);
      expect(mockedApi.get).toHaveBeenCalledWith('/projects/1/members', {
        params: { limit: 500, offset: 0 },
        signal: undefined,
      });
      expect(result).toEqual([mockProjectMember]);
    });
  });

  describe('getProjectStatuses', () => {
    it('should fetch statuses successfully', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [mockProjectStatus] });
      const result = await getProjectStatuses();
      expect(mockedApi.get).toHaveBeenCalledWith('/projects/statuses', {
        signal: undefined,
      });
      expect(result).toEqual([mockProjectStatus]);
    });
  });

  describe('addProjectMember', () => {
    it('should add member successfully', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: mockProjectMember });

      const result = await addProjectMember(1, 1);

      expect(mockedApi.post).toHaveBeenCalledWith('/projects/1/members', {
        userId: 1,
      });
      expect(result).toEqual(mockProjectMember);
    });

    it('should throw error when adding member fails', async () => {
      const error = new Error('Add member failed');
      mockedApi.post.mockRejectedValueOnce(error);

      await expect(addProjectMember(1, 1)).rejects.toThrow(error);
    });
  });

  describe('removeProjectMember', () => {
    it('should remove member successfully', async () => {
      mockedApi.delete.mockResolvedValueOnce({ data: null });

      await removeProjectMember(1, 1);

      expect(mockedApi.delete).toHaveBeenCalledWith('/projects/1/members', {
        data: { userId: 1 },
      });
    });

    it('should throw error when removing member fails', async () => {
      const error = new Error('Remove member failed');
      mockedApi.delete.mockRejectedValueOnce(error);

      await expect(removeProjectMember(1, 1)).rejects.toThrow(error);
    });
  });

  describe('getSubprojects', () => {
    it('should fetch subprojects successfully', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [mockProject] });

      const result = await getSubprojects(1);

      expect(mockedApi.get).toHaveBeenCalledWith('/projects/1/subprojects', {
        params: { limit: 500, offset: 0 },
        signal: undefined,
      });
      expect(result).toEqual([mockProject]);
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Network error');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(getSubprojects(1)).rejects.toThrow(error);
    });
  });
});
