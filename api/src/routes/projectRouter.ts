import { Router } from 'express';
import { Pool } from 'pg';
import checkPermission from '../middleware/permissionMiddleware';
import * as projectController from '../controllers/projectController';
import * as timeLogController from '../controllers/timeLogController';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.get('/statuses', withPool(pool, projectController.getProjectStatuses));
  router.get('/', withPool(pool, projectController.getProjects));
  router.get('/:id', withPool(pool, projectController.getProjectById));
  router.get('/:id/details', withPool(pool, projectController.getProjectDetails));
  router.post('/', checkPermission(pool, 'Create projects'), withPool(pool, projectController.createProject));
  router.patch('/:id/status', checkPermission(pool, 'Edit projects'), withPool(pool, projectController.changeProjectStatus));
  router.put('/:id', checkPermission(pool, 'Edit projects'), withPool(pool, projectController.updateProject));
  router.delete('/:id', checkPermission(pool, 'Delete projects'), withPool(pool, projectController.deleteProject));
  router.get('/:id/tasks', withPool(pool, projectController.getProjectTasks));
  router.get('/:id/members', withPool(pool, projectController.getProjectMembers));
  router.post('/:id/members', checkPermission(pool, 'Edit projects'), withPool(pool, projectController.addProjectMember));
  router.delete('/:id/members', checkPermission(pool, 'Edit projects'), withPool(pool, projectController.deleteProjectMember));
  router.get('/:id/subprojects', withPool(pool, projectController.getSubprojects));
  router.get('/:id/time-logs', withPool(pool, timeLogController.getProjectTimeLogs));
  router.get('/:id/spent-time', withPool(pool, timeLogController.getProjectSpentTime));

  return router;
}
