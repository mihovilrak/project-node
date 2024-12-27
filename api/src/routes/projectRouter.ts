import express, { Router, Request } from 'express';
import { DatabasePool } from '../types/models';
import checkPermission from '../middleware/permissionMiddleware';
import * as projectController from '../controllers/projectController';
import * as timeLogController from '../controllers/timeLogController';
import { ProjectUpdateInput, ProjectTaskFilters } from '../types/project';
import { ProjectRequest } from '../types/express';

export default function projectRouter(pool: DatabasePool): Router {
  const router = express.Router();

  // Get project statuses route
  router.get('/statuses', (req, res) =>
    projectController.getProjectStatuses(req, res, pool));

  // Get projects route
  router.get('/', (req, res) =>
    projectController.getProjects(req, res, pool));

  // Get project by ID route
  router.get('/:id', (req: Request<{ id: string }>, res) =>
    projectController.getProjectById(req, res, pool));

  // Get project details route
  router.get('/:id/details', (req: Request<{ id: string }>, res) =>
    projectController.getProjectDetails(req, res, pool));

  // Create project route
  router.post('/',
    checkPermission(pool, 'Create projects'),
    (req: ProjectRequest, res) => 
      projectController.createProject(req, res, pool)
  );

  // Change project status route
  router.patch('/:id/status',
    checkPermission(pool, 'Edit projects'),
    (req: Request<{ id: string }, {}, { status: string }>, res) => 
      projectController.changeProjectStatus(req, res, pool)
  );

  // Update project route
  router.put('/:id',
    checkPermission(pool, 'Edit projects'),
    (req: Request<{ id: string }, {}, ProjectUpdateInput>, res) => 
      projectController.updateProject(req, res, pool)
  );

  // Delete project route
  router.delete('/:id',
    checkPermission(pool, 'Delete projects'),
    (req: Request<{ id: string }>, res) => 
      projectController.deleteProject(req, res, pool)
  );

  // Get tasks by project ID
  router.get('/:id/tasks', (req: Request<{ id: string }, {}, {}, ProjectTaskFilters>, res) =>
    projectController.getProjectTasks(req, res, pool));

  // Get project members route
  router.get('/:id/members', (req: Request<{ id: string }>, res) =>
    projectController.getProjectMembers(req, res, pool));

  // Add project member
  router.post('/:id/members',
    checkPermission(pool, 'Edit projects'),
    (req: Request<{ id: string }, {}, { userId: string }>, res) =>
      projectController.addProjectMember(req, res, pool)
  );

  // Delete project member
  router.delete('/:id/members',
    checkPermission(pool, 'Edit projects'),
    (req: Request<{ id: string }, {}, { userId: string }>, res) =>
      projectController.deleteProjectMember(req, res, pool)
  );

  // Get subprojects
  router.get('/:id/subprojects', (req: Request<{ id: string }>, res) =>
    projectController.getSubprojects(req, res, pool));

  // Time log related routes
  router.get('/:id/time-logs', (req: Request<{ id: string }>, res) =>
    timeLogController.getProjectTimeLogs(req, res, pool));

  router.get('/:id/spent-time', (req: Request<{ id: string }>, res) =>
    timeLogController.getProjectSpentTime(req, res, pool));

  return router;
}
