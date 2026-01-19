import { Request, Response } from 'express';
import { Pool } from 'pg';
import { jest } from '@jest/globals';
import * as profileModel from '../../models/profileModel';
import {
  getProfile,
  updateProfile,
  getRecentTasks,
  getRecentProjects,
  changePassword
} from '../profileController';
import {
  Profile,
  ProfileUpdateInput,
  PasswordUpdateInput,
  ProfileStats
} from '../../types/profile';
import { Task } from '../../types/task';
import { Project } from '../../types/project';
import { Session, SessionData } from 'express-session';

// Mock the profile model
jest.mock('../../models/profileModel');

describe('Profile Controller', () => {
  let mockPool: Pool;
  let mockRequest: Partial<Request>;
  let mockResponse: Response;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPool = {} as Pool;
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response;

    // Create a partial mock Session object with required properties
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
      regenerate: (callback: (err: any) => void) => callback(null),
      destroy: (callback: (err: any) => void) => callback(null),
      reload: (callback: (err: any) => void) => callback(null),
      resetMaxAge: () => {},
      touch: (callback: (err: any) => void) => callback(null),
      save: (callback: (err: any) => void) => callback(null),
      user: {
        id: '1',
        login: 'test',
        role_id: 1
      }
    } as Session & Partial<SessionData>;

    mockRequest = {
      params: {},
      body: {},
      session: mockSession
    };
  });

  describe('getProfile', () => {
    const mockProfile: Profile = {
      id: 1,
      name: 'John',
      surname: 'Doe',
      email: 'john@example.com',
      login: 'johndoe',
      created_on: new Date(),
      updated_on: new Date(),
      active: true
    };

    it('should return profile data when authenticated', async () => {
      jest.spyOn(profileModel, 'getProfile').mockResolvedValue(mockProfile);

      await getProfile(mockRequest as Request, mockResponse, mockPool);

      expect(profileModel.getProfile).toHaveBeenCalledWith(mockPool, '1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockProfile);
    });

    it('should return 401 when unauthenticated', async () => {
      mockRequest.session = {
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
        regenerate: (callback: (err: any) => void) => callback(null),
        destroy: (callback: (err: any) => void) => callback(null),
        reload: (callback: (err: any) => void) => callback(null),
        resetMaxAge: () => {},
        touch: (callback: (err: any) => void) => callback(null),
        save: (callback: (err: any) => void) => callback(null)
      } as Session & Partial<SessionData>;

      await getProfile(mockRequest as Request, mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should handle internal server errors', async () => {
      jest.spyOn(profileModel, 'getProfile').mockRejectedValue(new Error('DB error'));

      await getProfile(mockRequest as Request, mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should handle case when profile is not found', async () => {
      const getProfileSpy = jest.spyOn(profileModel, 'getProfile').mockResolvedValueOnce(null);

      await getProfile(mockRequest as Request, mockResponse, mockPool);

      expect(getProfileSpy).toHaveBeenCalledWith(mockPool, '1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(null);
    });
  });

  describe('updateProfile', () => {
    const mockUpdatedProfile: Profile = {
      id: 1,
      name: 'Updated',
      surname: 'User',
      email: 'updated@example.com',
      login: 'updateduser',
      created_on: new Date(),
      updated_on: new Date(),
      active: true
    };

    it('should update profile with valid data', async () => {
      mockRequest.body = {
        name: 'Updated',
        surname: 'User',
        email: 'updated@example.com'
      };

      jest.spyOn(profileModel, 'updateProfile').mockResolvedValue(mockUpdatedProfile);

      await updateProfile(mockRequest as Request, mockResponse, mockPool);

      expect(profileModel.updateProfile).toHaveBeenCalledWith(
        mockPool,
        '1',
        expect.objectContaining({
          name: 'Updated',
          surname: 'User',
          email: 'updated@example.com'
        })
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedProfile);
    });

    it('should handle partial updates', async () => {
      mockRequest.body = { name: 'New Name' };
      jest.spyOn(profileModel, 'updateProfile').mockResolvedValue(mockUpdatedProfile);

      await updateProfile(mockRequest as Request, mockResponse, mockPool);

      expect(profileModel.updateProfile).toHaveBeenCalledWith(
        mockPool,
        '1',
        expect.objectContaining({ name: 'New Name' })
      );
    });

    it('should return 401 when unauthenticated', async () => {
      mockRequest.session = {
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
        regenerate: (callback: (err: any) => void) => callback(null),
        destroy: (callback: (err: any) => void) => callback(null),
        reload: (callback: (err: any) => void) => callback(null),
        resetMaxAge: () => {},
        touch: (callback: (err: any) => void) => callback(null),
        save: (callback: (err: any) => void) => callback(null)
      } as Session & Partial<SessionData>;

      await updateProfile(mockRequest as Request, mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });

    it('should handle case when profile update fails', async () => {
      mockRequest.body = { name: 'New Name' };
      const updateProfileSpy = jest.spyOn(profileModel, 'updateProfile').mockResolvedValueOnce(null);

      await updateProfile(mockRequest as Request, mockResponse, mockPool);

      expect(updateProfileSpy).toHaveBeenCalledWith(
        mockPool,
        '1',
        expect.objectContaining({ name: 'New Name' })
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(null);
    });
  });

  describe('getRecentTasks', () => {
    const mockTasks: Task[] = [{
      id: 1,
      name: 'Recent Task',
      description: 'Task description',
      project_id: 1,
      holder_id: 1,
      assignee_id: 1,
      status_id: 1,
      priority_id: 1,
      type_id: 1,
      start_date: new Date(),
      due_date: new Date(),
      estimated_time: 2,
      created_on: new Date(),
      created_by: 1,
      updated_on: new Date(),
      progress: 0
    }];

    it('should fetch recent tasks', async () => {
      jest.spyOn(profileModel, 'getRecentTasks').mockResolvedValue(mockTasks);

      await getRecentTasks(mockRequest as Request, mockResponse, mockPool);

      expect(profileModel.getRecentTasks).toHaveBeenCalledWith(mockPool, '1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockTasks);
    });

    it('should handle empty task list', async () => {
      jest.spyOn(profileModel, 'getRecentTasks').mockResolvedValue([]);

      await getRecentTasks(mockRequest as Request, mockResponse, mockPool);

      expect(mockJson).toHaveBeenCalledWith([]);
    });
  });

  describe('getRecentProjects', () => {
    const mockProjects: Project[] = [{
      id: 1,
      name: 'Recent Project',
      description: 'Project description',
      start_date: new Date(),
      due_date: new Date(),
      end_date: null,
      created_by: 1,
      status_id: 1,
      created_on: new Date(),
      updated_on: null
    }];

    it('should fetch recent projects', async () => {
      jest.spyOn(profileModel, 'getRecentProjects').mockResolvedValue(mockProjects);

      await getRecentProjects(mockRequest as Request, mockResponse, mockPool);

      expect(profileModel.getRecentProjects).toHaveBeenCalledWith(mockPool, '1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockProjects);
    });

    it('should handle database errors', async () => {
      jest.spyOn(profileModel, 'getRecentProjects').mockRejectedValue(new Error('DB error'));

      await getRecentProjects(mockRequest as Request, mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('changePassword', () => {
    it('should update password with valid input', async () => {
      const updatedOn = new Date();
      mockRequest.body = {
        old_password: 'oldPass123',
        new_password: 'newPass123'
      };

      jest.spyOn(profileModel, 'verifyPassword').mockResolvedValue(true);
      jest.spyOn(profileModel, 'changePassword').mockResolvedValue({ updated_on: updatedOn } as any);

      await changePassword(mockRequest as Request, mockResponse, mockPool);

      expect(profileModel.verifyPassword).toHaveBeenCalledWith(mockPool, '1', 'oldPass123');
      expect(profileModel.changePassword).toHaveBeenCalledWith(mockPool, '1', 'newPass123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: `Password updated successfully on ${updatedOn}` });
    });

    it('should return 400 with invalid passwords', async () => {
      mockRequest.body = { old_password: ' ', new_password: '  ' };

      jest.spyOn(profileModel, 'verifyPassword').mockResolvedValue(false);

      await changePassword(mockRequest as Request, mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Current password is incorrect' });
    });

    it('should handle incorrect old password', async () => {
      mockRequest.body = {
        old_password: 'wrongPass',
        new_password: 'newPass123'
      };
      jest.spyOn(profileModel, 'verifyPassword').mockResolvedValue(false);

      await changePassword(mockRequest as Request, mockResponse, mockPool);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Current password is incorrect' });
    });
  });
});