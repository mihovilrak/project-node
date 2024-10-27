const express = require('express');
const projectController = require('../controllers/projectController');

module.exports = (pool) => {
  const router = express.Router();

  // Get projects route
  router.get('/', (req, res) => projectController.getProjects(req, res, pool));

  // Get project by ID route
  router.get('/:id', (req, res) => projectController.getProjectById(req, res, pool));

  // Create project route
  router.post('/', (req, res) => projectController.createProject(req, res, pool));

  // Change project status route
  router.patch('/:id/status', (req, res) => projectController.changeProjectStatus(req, res, pool));

  // Update project route
  router.put('/:id', (req, res) => projectController.updateProject(req, res, pool));

  // Delete project route
  router.delete('/:id', (req, res) => projectController.deleteProject(req, res, pool));

  return router;
};
