import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as projectController from '../projectController';
import * as projectModel from '../../models/projectModel';
import * as notificationModel from '../../models/notificationModel';
import { Session } from 'express-session';
import { ProjectRequest } from '../../types/express';

// Mock the models
jest.mock('../../models/projectModel');
jest.mock('../../models/notificationModel');

describe('ProjectController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
    const mockSession = {
      id: 'test-session-id',
      cookie: {
        originalMaxAge: null,
        expires: undefined,
        secure: false,
        httpOnly: true,
        path: '/',
        domain: undefined,
        sameSite: 'strict'
      },
      regenerate: jest.fn((callback: (err: any) => void) => {
        callback(null);
        return mockSession as unknown as Session;
      }),
      destroy: jest.fn((callback: (err: any) => void) => {
        callback(null);
        return mockSession as unknown as Session;
      }),
      reload: jest.fn((callback: (err: any) => void) => {
        callback(null);
        return mockSession as unknown as Session;
      }),
      resetMaxAge: jest.fn().mockReturnThis(),
      touch: jest.fn(),
      save: jest.fn((callback?: (err: any) => void) => {
        if (callback) callback(null);
        return mockSession as unknown as Session;
      }),
      user: {
        id: '1',
        login: 'test',
        role_id: 1
      }
    } as unknown as Session & Partial<{ user: { id: string; login: string; role_id: number } }>;

    mockReq = {
      params: {},
      query: {},
      body: {},
      session: mockSession
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockPool = {};
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should return all projects with default active-only filter', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', status_id: 1 },
        { id: '2', name: 'Project 2', status_id: 1 }
      ];
      (projectModel.getProjects as jest.Mock).mockResolvedValue(mockProjects);

      await projectController.getProjects(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.getProjects).toHaveBeenCalledWith(mockPool, { status_id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockProjects);
    });

    it('should return empty array when no projects found', async () => {
      (projectModel.getProjects as jest.Mock).mockResolvedValue([]);

      await projectController.getProjects(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors', async () => {
      (projectModel.getProjects as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.getProjects(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getProjectById', () => {
    it('should return a project when found', async () => {
      const mockProject = { id: '1', name: 'Project 1', status_id: 1 };
      mockReq.params = { id: '1' };
      (projectModel.getProjectById as jest.Mock).mockResolvedValue(mockProject);

      await projectController.getProjectById(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.getProjectById).toHaveBeenCalledWith(mockPool, '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockProject);
    });

    it('should return 404 when project not found', async () => {
      mockReq.params = { id: '999' };
      (projectModel.getProjectById as jest.Mock).mockResolvedValue(null);

      await projectController.getProjectById(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Project not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      (projectModel.getProjectById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.getProjectById(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getProjectDetails', () => {
    it('should return project details when found', async () => {
      const mockDetails = { id: '1', name: 'Project 1', status_id: 1, tasks_count: 5 };
      mockReq.params = { id: '1' };
      (projectModel.getProjectDetails as jest.Mock).mockResolvedValue(mockDetails);

      await projectController.getProjectDetails(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.getProjectDetails).toHaveBeenCalledWith(mockPool, '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockDetails);
    });

    it('should return 404 when project not found', async () => {
      mockReq.params = { id: '999' };
      (projectModel.getProjectDetails as jest.Mock).mockResolvedValue(null);

      await projectController.getProjectDetails(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Project not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      (projectModel.getProjectDetails as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.getProjectDetails(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const mockProjectData = {
        name: 'New Project',
        description: 'Project description',
        start_date: new Date(),
        due_date: new Date(),
        parent_id: null
      };
      const createdProject = { id: '3', ...mockProjectData, created_by: '1' };
      mockReq.body = mockProjectData;
      (projectModel.createProject as jest.Mock).mockResolvedValue(createdProject);

      await projectController.createProject(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.createProject).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdProject);
    });

    it('should return 401 when user not authenticated', async () => {
      mockReq.session!.user = undefined;
      mockReq.body = { name: 'New Project' };

      await projectController.createProject(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.body = { description: 'Missing name and dates' };

      await projectController.createProject(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Missing required fields', required: expect.any(Array) })
      );
      expect(projectModel.createProject).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockReq.body = {
        name: 'New Project',
        start_date: new Date(),
        due_date: new Date()
      };
      (projectModel.createProject as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.createProject(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('changeProjectStatus', () => {
    it('should change project status successfully', async () => {
      const updatedProject = { id: '1', name: 'Project 1', status_id: 2 };
      mockReq.params = { id: '1' };
      mockReq.body = { status: 'completed' };
      (projectModel.changeProjectStatus as jest.Mock).mockResolvedValue(updatedProject);

      await projectController.changeProjectStatus(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.changeProjectStatus).toHaveBeenCalledWith(mockPool, '1', 'completed');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedProject);
    });

    it('should return 404 when project not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { status: 'completed' };
      (projectModel.changeProjectStatus as jest.Mock).mockResolvedValue(null);

      await projectController.changeProjectStatus(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Project not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { status: 'completed' };
      (projectModel.changeProjectStatus as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.changeProjectStatus(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateProject', () => {
    it('should update a project successfully', async () => {
      const updates = { name: 'Updated Project Name' };
      const updatedProject = { id: '1', name: 'Updated Project Name', status_id: 1 };
      mockReq.params = { id: '1' };
      mockReq.body = updates;
      (projectModel.updateProject as jest.Mock).mockResolvedValue(updatedProject);

      await projectController.updateProject(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.updateProject).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedProject);
    });

    it('should return 404 when project not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { name: 'Updated Name' };
      (projectModel.updateProject as jest.Mock).mockResolvedValue(null);

      await projectController.updateProject(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Project not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Updated Name' };
      (projectModel.updateProject as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.updateProject(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteProject', () => {
    it('should delete a project successfully', async () => {
      mockReq.params = { id: '1' };
      (projectModel.deleteProject as jest.Mock).mockResolvedValue({ success: true });

      await projectController.deleteProject(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.deleteProject).toHaveBeenCalledWith(mockPool, '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 404 when project not found', async () => {
      mockReq.params = { id: '999' };
      (projectModel.deleteProject as jest.Mock).mockResolvedValue(null);

      await projectController.deleteProject(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Project not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      (projectModel.deleteProject as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.deleteProject(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getProjectMembers', () => {
    it('should return project members', async () => {
      const mockMembers = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
      ];
      mockReq.params = { id: '1' };
      (projectModel.getProjectMembers as jest.Mock).mockResolvedValue(mockMembers);

      await projectController.getProjectMembers(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.getProjectMembers).toHaveBeenCalledWith(mockPool, '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockMembers);
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      (projectModel.getProjectMembers as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.getProjectMembers(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('addProjectMember', () => {
    it('should add a project member successfully', async () => {
      const mockResult = { project_id: '1', user_id: '2' };
      mockReq.params = { id: '1' };
      mockReq.body = { userId: '2' };
      (projectModel.addProjectMember as jest.Mock).mockResolvedValue(mockResult);
      (notificationModel.createProjectMemberNotifications as jest.Mock).mockResolvedValue(undefined);

      await projectController.addProjectMember(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.addProjectMember).toHaveBeenCalledWith(mockPool, '1', '2');
      expect(notificationModel.createProjectMemberNotifications).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 404 when project or user not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { userId: '2' };
      (projectModel.addProjectMember as jest.Mock).mockResolvedValue(null);

      await projectController.addProjectMember(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Project or user not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { userId: '2' };
      (projectModel.addProjectMember as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.addProjectMember(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteProjectMember', () => {
    it('should delete a project member successfully', async () => {
      const mockResult = { success: true };
      mockReq.params = { id: '1' };
      mockReq.body = { userId: '2' };
      (projectModel.deleteProjectMember as jest.Mock).mockResolvedValue(mockResult);

      await projectController.deleteProjectMember(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.deleteProjectMember).toHaveBeenCalledWith(mockPool, '1', '2');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 404 when project member not found', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { userId: '999' };
      (projectModel.deleteProjectMember as jest.Mock).mockResolvedValue(null);

      await projectController.deleteProjectMember(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Project member not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { userId: '2' };
      (projectModel.deleteProjectMember as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.deleteProjectMember(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getSubprojects', () => {
    it('should return subprojects', async () => {
      const mockSubprojects = [
        { id: '2', name: 'Subproject 1', parent_id: '1' }
      ];
      mockReq.params = { id: '1' };
      (projectModel.getSubprojects as jest.Mock).mockResolvedValue(mockSubprojects);

      await projectController.getSubprojects(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.getSubprojects).toHaveBeenCalledWith(mockPool, '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSubprojects);
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      (projectModel.getSubprojects as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.getSubprojects(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getProjectTasks', () => {
    it('should return project tasks', async () => {
      const mockTasks = [
        { id: '1', name: 'Task 1', project_id: '1' },
        { id: '2', name: 'Task 2', project_id: '1' }
      ];
      mockReq.params = { id: '1' };
      (projectModel.getProjectTasks as jest.Mock).mockResolvedValue(mockTasks);

      await projectController.getProjectTasks(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.getProjectTasks).toHaveBeenCalledWith(mockPool, '1', {});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
    });

    it('should pass filters to model', async () => {
      const mockTasks = [{ id: '1', name: 'Task 1', project_id: '1' }];
      mockReq.params = { id: '1' };
      mockReq.query = { status: 'active', priority: 'high', assignee: '2' };
      (projectModel.getProjectTasks as jest.Mock).mockResolvedValue(mockTasks);

      await projectController.getProjectTasks(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.getProjectTasks).toHaveBeenCalledWith(mockPool, '1', {
        status: 'active',
        priority: 'high',
        assignee: '2'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      (projectModel.getProjectTasks as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.getProjectTasks(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getProjectStatuses', () => {
    it('should return project statuses', async () => {
      const mockStatuses = [
        { id: 1, name: 'Active' },
        { id: 2, name: 'Completed' }
      ];
      (projectModel.getProjectStatuses as jest.Mock).mockResolvedValue(mockStatuses);

      await projectController.getProjectStatuses(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(projectModel.getProjectStatuses).toHaveBeenCalledWith(mockPool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockStatuses);
    });

    it('should handle errors', async () => {
      (projectModel.getProjectStatuses as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.getProjectStatuses(
        mockReq as any,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
