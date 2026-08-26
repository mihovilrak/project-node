import { Router } from 'express';
import { Pool } from 'pg';
import checkPermission from '../middleware/permissionMiddleware';
import { requireProjectAccess } from '../middleware/projectAccessMiddleware';
import * as projectController from '../controllers/projectController';
import * as timeLogController from '../controllers/timeLogController';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();
  const projectAccess = requireProjectAccess(pool);

  router.get('/statuses', withPool(pool, projectController.getProjectStatuses));
  router.get('/', withPool(pool, projectController.getProjects));
  router.get(
    '/:id',
    projectAccess,
    withPool(pool, projectController.getProjectById),
  );
  router.get(
    '/:id/details',
    projectAccess,
    withPool(pool, projectController.getProjectDetails),
  );
  router.post(
    '/',
    checkPermission(pool, 'Create projects'),
    withPool(pool, projectController.createProject),
  );
  router.patch(
    '/:id/status',
    checkPermission(pool, 'Edit projects'),
    projectAccess,
    withPool(pool, projectController.changeProjectStatus),
  );
  router.put(
    '/:id',
    checkPermission(pool, 'Edit projects'),
    projectAccess,
    withPool(pool, projectController.updateProject),
  );
  router.delete(
    '/:id',
    checkPermission(pool, 'Delete projects'),
    projectAccess,
    withPool(pool, projectController.deleteProject),
  );
  router.get(
    '/:id/tasks',
    projectAccess,
    withPool(pool, projectController.getProjectTasks),
  );
  router.get(
    '/:id/members',
    projectAccess,
    withPool(pool, projectController.getProjectMembers),
  );
  router.post(
    '/:id/members',
    checkPermission(pool, 'Edit projects'),
    projectAccess,
    withPool(pool, projectController.addProjectMember),
  );
  router.delete(
    '/:id/members',
    checkPermission(pool, 'Edit projects'),
    projectAccess,
    withPool(pool, projectController.deleteProjectMember),
  );
  router.get(
    '/:id/subprojects',
    projectAccess,
    withPool(pool, projectController.getSubprojects),
  );
  router.get(
    '/:id/time-logs',
    projectAccess,
    withPool(pool, timeLogController.getProjectTimeLogs),
  );
  router.get(
    '/:id/spent-time',
    projectAccess,
    withPool(pool, timeLogController.getProjectSpentTime),
  );

  return router;
};
