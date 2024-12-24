const express = require('express');
const { checkPermission } = require('../middleware/permissionMiddleware');
const projectController = require('../controllers/projectController');
const timeLogController = require('../controllers/timeLogController');

// Project routes
module.exports = (pool) => {
  const router = express.Router();

  // Get project statuses route
  router.get('/statuses', (req, res) =>
    projectController.getProjectStatuses(req, res, pool));

  // Get projects route
  router.get('/', (req, res) =>
    projectController.getProjects(req, res, pool));

  // Get project by ID route
  router.get('/:id', (req, res) =>
    projectController.getProjectById(req, res, pool));

  // Get project details route
  router.get('/:id/details', (req, res) =>
    projectController.getProjectDetails(req, res, pool));

  // Create project route
  router.post('/', checkPermission(pool, 'Create projects'), (req, res) =>
    projectController.createProject(req, res, pool));

  // Change project status route
  router.patch('/:id/status', checkPermission(pool, 'Edit projects'), (req, res) =>
    projectController.changeProjectStatus(req, res, pool));

  // Update project route
  router.put('/:id', checkPermission(pool, 'Edit projects'), (req, res) =>
    projectController.updateProject(req, res, pool));

  // Delete project route
  router.delete('/:id', checkPermission(pool, 'Delete projects'), (req, res) =>
    projectController.deleteProject(req, res, pool));

  // Get tasks by project ID
  router.get('/:id/tasks', (req, res) =>
    projectController.getProjectTasks(req, res, pool));

  // Create task route
  router.post('/:id/tasks', checkPermission(pool, 'Create tasks'), (req, res) =>
    projectController.createTask(req, res, pool));

  // Get project members route
  router.get('/:id/members', (req, res) =>
    projectController.getProjectMembers(req, res, pool));

  // Add project member
  router.post('/:id/members', checkPermission(pool, 'Create projects'), (req, res) =>
    projectController.addProjectMember(req, res, pool));

  // Delete project member
  router.delete('/:id/members', checkPermission(pool, 'Edit projects'), (req, res) =>
    projectController.deleteProjectMember(req, res, pool));

  // Get subprojects
  router.get('/:id/subprojects', (req, res) => 
    projectController.getSubprojects(req, res, pool));

  // Time log related routes
  router.get('/:id/time-logs', (req, res) =>
    timeLogController.getProjectTimeLogs(req, res, pool));

  router.get('/:id/spent-time', (req, res) =>
    timeLogController.getProjectSpentTime(req, res, pool));

  return router;
};
